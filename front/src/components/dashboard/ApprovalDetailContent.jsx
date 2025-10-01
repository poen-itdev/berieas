import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Chip,
  Divider,
} from '@mui/material';
import { Download, CheckCircle, Cancel } from '@mui/icons-material';
import { API_URLS } from '../../config/api';
import { apiRequest } from '../../utils/apiHelper';
import PageHeader from '../common/PageHeader';

const ApprovalDetailContent = ({ userInfo }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [approvalData, setApprovalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState([]); // 등록된 첨언 목록
  const [editingComment, setEditingComment] = useState(null); // 수정 중인 첨언 ID

  const approvalNo = searchParams.get('approvalNo');

  // 기안서 상세 데이터 로드
  const loadApprovalDetail = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(
        `${API_URLS.APPROVAL_GET_DRAFT}/${approvalNo}`,
        {
          method: 'GET',
        }
      );

      if (response.ok) {
        setApprovalData(response.data);
      } else {
        console.error('기안서 상세 로드 실패:', response.status, response.data);
        alert(`기안서를 불러올 수 없습니다.\n${response.data || ''}`);
        navigate('/progress-list');
      }
    } catch (error) {
      console.error('기안서 상세 로드 실패:', error);
      alert('기안서를 불러올 수 없습니다.');
      navigate('/progress-list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (approvalNo) {
      loadApprovalDetail();
    }
  }, [approvalNo]);

  // 결재 처리
  const handleApproval = async (action) => {
    try {
      setSubmitting(true);
      const response = await apiRequest(API_URLS.APPROVAL_APPROVE, {
        method: 'POST',
        body: JSON.stringify({
          approvalNo: parseInt(approvalNo),
          action: action, // 'approve' 또는 'reject'
          comment: comment.trim() || null, // 첨언은 선택사항
        }),
      });

      if (response.ok) {
        alert(action === 'approve' ? '승인되었습니다.' : '반려되었습니다.');
        navigate('/progress-list');
      } else {
        alert('처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('결재 처리 실패:', error);
      alert('처리에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  // 기안취소 처리 (진행중 -> 기안중으로 되돌리기)
  const handleCancelApproval = async () => {
    if (
      !confirm(
        '기안을 취소하시겠습니까?\n다음 결재자의 결재가 이루어진 경우 취소 불가합니다.'
      )
    )
      return;

    try {
      setSubmitting(true);

      const response = await apiRequest(
        `${API_URLS.APPROVAL_CANCEL}/${approvalNo}`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        alert('기안이 취소되었습니다. 기안중 상태로 변경되었습니다.');
        navigate('/progress-list');
      } else {
        alert(response.data || '기안취소에 실패했습니다. 조건을 확인해주세요.');
      }
    } catch (error) {
      console.error('기안취소 실패:', error);
      alert('기안취소에 실패했습니다: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 파일 다운로드
  const handleFileDownload = (fileName) => {
    const downloadUrl = `${API_URLS.APPROVAL_FILE_DOWNLOAD}/${approvalNo}/${fileName}`;
    window.open(downloadUrl, '_blank');
  };

  // 첨언 등록
  const handleCommentSubmit = () => {
    if (!comment.trim()) return;

    const newComment = {
      id: Date.now(), // 임시 ID
      content: comment.trim(),
      author: userInfo?.memberName || '현재 사용자',
      date: new Date().toLocaleString(),
    };

    setComments([...comments, newComment]);
    setComment('');
  };

  // 첨언 수정
  const handleCommentEdit = (commentId) => {
    const commentToEdit = comments.find((c) => c.id === commentId);
    if (commentToEdit) {
      setComment(commentToEdit.content);
      setEditingComment(commentId);
    }
  };

  // 첨언 수정 완료
  const handleCommentUpdate = () => {
    if (!comment.trim() || !editingComment) return;

    setComments(
      comments.map((c) =>
        c.id === editingComment
          ? { ...c, content: comment.trim(), date: new Date().toLocaleString() }
          : c
      )
    );
    setComment('');
    setEditingComment(null);
  };

  // 첨언 삭제
  const handleCommentDelete = (commentId) => {
    if (window.confirm('첨언을 삭제하시겠습니까?')) {
      setComments(comments.filter((c) => c.id !== commentId));
    }
  };

  // 첨언 수정 취소
  const handleCommentCancel = () => {
    setComment('');
    setEditingComment(null);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, mt: 3, textAlign: 'center' }}>
        <Typography>로딩 중...</Typography>
      </Box>
    );
  }

  if (!approvalData) {
    return (
      <Box sx={{ p: 3, mt: 3, textAlign: 'center' }}>
        <Typography>기안서를 찾을 수 없습니다.</Typography>
      </Box>
    );
  }

  // 결재라인 구성
  const approvalLine = [];

  // 기안자 (실제 기안자 이름과 직급)
  if (approvalData.approvalName) {
    approvalLine.push({
      title: '기안자',
      name: approvalData.approvalName,
      date: approvalData.startDate || null,
      status: 'draft',
    });
  }

  // 결재자들 (signId1~5) - 모두 "결재자"로 통일
  for (let i = 1; i <= 5; i++) {
    const signId = approvalData[`signId${i}`];
    if (signId) {
      approvalLine.push({
        title: '결재자', // 모든 결재자를 "결재자"로 통일
        name: signId,
        date: approvalData[`signDate${i}`] || null,
        status: approvalData[`signStatus${i}`] || 'pending',
      });
    }
  }

  return (
    <Box sx={{ p: 3, mt: 3 }}>
      <PageHeader title="기안서 상세" fontSize="30px" />

      <Paper sx={{ p: 4, mt: 3 }}>
        {/* 문서 제목 */}
        <Typography
          variant="h4"
          sx={{ mb: 2, textAlign: 'center', fontWeight: 600 }}
        >
          {approvalData.approvalTitle}
        </Typography>

        {/* 결재라인 - 제목 바로 밑 오른쪽 정렬 */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'flex-end' }}>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ maxWidth: 'fit-content' }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  {/* 모든 직급 헤더들 */}
                  {approvalLine.map((item, index) => (
                    <TableCell
                      key={index}
                      align="center"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        py: 1,
                        px: 2,
                        backgroundColor: 'grey.100',
                      }}
                    >
                      {item.title}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  {/* 모든 데이터 */}
                  {approvalLine.map((item, index) => (
                    <TableCell key={index} align="center" sx={{ py: 1, px: 2 }}>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 500,
                            fontSize: '0.7rem',
                            color:
                              item.status === 'approved'
                                ? 'success.main'
                                : item.status === 'rejected'
                                ? 'error.main'
                                : item.status === 'draft'
                                ? 'primary.main'
                                : 'text.primary',
                          }}
                        >
                          {item.name}
                        </Typography>
                        {item.date && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: '0.65rem', display: 'block' }}
                          >
                            {new Date(item.date).toLocaleDateString()}
                          </Typography>
                        )}
                        {!item.date && item.status === 'pending' && (
                          <Typography
                            variant="caption"
                            color="text.disabled"
                            sx={{ fontSize: '0.65rem', display: 'block' }}
                          >
                            대기중
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* 기안번호 */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="body1"
            sx={{ fontWeight: 500, textAlign: 'left' }}
          >
            기안번호: {approvalNo}
          </Typography>
        </Box>

        {/* 문서 내용 */}
        <Box sx={{ mb: 4 }}>
          <Paper variant="outlined" sx={{ p: 3, minHeight: 200 }}>
            <div
              dangerouslySetInnerHTML={{
                __html: approvalData.approvalDocument || '내용이 없습니다.',
              }}
            />
          </Paper>
        </Box>

        {/* 참조자 */}
        {approvalData.referenceId && (
          <Box sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{ mb: 2, fontWeight: 600, textAlign: 'left' }}
            >
              참조자
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {approvalData.referenceId.split(',').map((name, index) => (
                <Chip
                  key={index}
                  label={name.trim()}
                  variant="outlined"
                  color="secondary"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* 첨부파일 */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: 600, textAlign: 'left' }}
          >
            첨부파일
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {[
              approvalData.approvalAttachFile1,
              approvalData.approvalAttachFile2,
              approvalData.approvalAttachFile3,
              approvalData.approvalAttachFile4,
              approvalData.approvalAttachFile5,
            ]
              .filter(Boolean)
              .map((fileName, index) => (
                <Box
                  key={index}
                  sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                >
                  <Typography variant="body2">{fileName}</Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Download />}
                    onClick={() => handleFileDownload(fileName)}
                  >
                    다운로드
                  </Button>
                </Box>
              ))}
            {!approvalData.approvalAttachFile1 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: 'left' }}
              >
                첨부파일이 없습니다.
              </Typography>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 4 }} />

        {/* 첨언 */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, fontWeight: 600, textAlign: 'left' }}
          >
            첨언 (선택사항)
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2, textAlign: 'left' }}
          >
            * 각 결재자당 1개의 첨언만 작성할 수 있습니다.
          </Typography>

          {/* 등록된 첨언 목록 */}
          {comments.length > 0 && (
            <Box sx={{ mb: 3 }}>
              {comments.map((commentItem) => (
                <Paper
                  key={commentItem.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {commentItem.content}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {commentItem.author} • {commentItem.date}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => handleCommentEdit(commentItem.id)}
                      disabled={editingComment === commentItem.id}
                    >
                      수정
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleCommentDelete(commentItem.id)}
                    >
                      삭제
                    </Button>
                  </Box>
                </Paper>
              ))}
            </Box>
          )}

          {/* 첨언 입력 */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
            <TextField
              fullWidth
              multiline
              rows={1}
              placeholder="의견을 입력하세요"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              variant="outlined"
            />
            <Box sx={{ display: 'flex', gap: 1 }}>
              {editingComment ? (
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ minWidth: 80, height: '56px' }}
                    onClick={handleCommentUpdate}
                    disabled={!comment.trim()}
                  >
                    수정
                  </Button>
                  <Button
                    variant="outlined"
                    sx={{ minWidth: 80, height: '56px' }}
                    onClick={handleCommentCancel}
                  >
                    취소
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  sx={{ minWidth: 100, height: '56px' }}
                  onClick={handleCommentSubmit}
                  disabled={!comment.trim()}
                >
                  등록
                </Button>
              )}
            </Box>
          </Box>
        </Box>

        {/* 결재 버튼 */}
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
          {/* 기안자인 경우 - 기안취소 버튼 */}
          {approvalData.approvalName === userInfo?.memberName && (
            <Button
              variant="contained"
              color="warning"
              size="large"
              startIcon={<Cancel />}
              onClick={handleCancelApproval}
              disabled={submitting}
              sx={{ minWidth: 120 }}
            >
              기안취소
            </Button>
          )}

          {/* 결재자인 경우 - 승인/반려 버튼 */}
          {approvalData.approvalName !== userInfo?.memberName && (
            <>
              <Button
                variant="contained"
                color="success"
                size="large"
                startIcon={<CheckCircle />}
                onClick={() => handleApproval('approve')}
                disabled={submitting}
                sx={{ minWidth: 120 }}
              >
                승인
              </Button>
              <Button
                variant="contained"
                color="error"
                size="large"
                startIcon={<Cancel />}
                onClick={() => handleApproval('reject')}
                disabled={submitting}
                sx={{ minWidth: 120 }}
              >
                반려
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default ApprovalDetailContent;
