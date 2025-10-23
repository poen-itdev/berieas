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
  Container,
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
        alert(`기안서를 불러올 수 없습니다.\n${response.data || ''}`);
        navigate('/progress-list');
      }
    } catch (error) {
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

      // 승인과 반려는 별도 엔드포인트 사용
      const apiUrl =
        action === 'approve'
          ? `${API_URLS.APPROVAL_APPROVE}/${approvalNo}`
          : `${API_URLS.APPROVAL_REJECT}/${approvalNo}`;

      const response = await apiRequest(apiUrl, {
        method: 'POST',
      });

      if (response.ok) {
        alert(action === 'approve' ? '승인되었습니다.' : '반려되었습니다.');
        // 데이터 다시 로드해서 결재라인 업데이트
        await loadApprovalDetail();
        // 잠시 후 진행목록으로 이동
        setTimeout(() => {
          navigate('/progress-list');
        }, 1000);
      } else {
        alert(`처리에 실패했습니다.\n${response.data || ''}`);
      }
    } catch (error) {
      alert('처리에 실패했습니다: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 기안취소 처리 (진행중 -> 기안중으로 되돌리기)
  const handleCancelApproval = async () => {
    try {
      setSubmitting(true);

      const response = await apiRequest(
        `${API_URLS.APPROVAL_CANCEL}/${approvalNo}`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        navigate('/progress-list');
      } else {
        alert(response.data || '기안취소에 실패했습니다. 조건을 확인해주세요.');
      }
    } catch (error) {
      alert('기안취소에 실패했습니다: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  // 파일 다운로드
  const handleFileDownload = (fileName, fileIndex) => {
    // 백엔드에서 요구하는 필드명으로 변환
    const fieldName = `approvalAttachFile${fileIndex + 1}`;
    const downloadUrl = `${API_URLS.APPROVAL_FILE_DOWNLOAD}/${approvalNo}/${fieldName}`;
    window.open(downloadUrl, '_blank');
  };

  // 첨언 등록
  const handleCommentSubmit = () => {
    if (!comment.trim()) return;

    // 현재 사용자가 이미 첨언을 작성했는지 확인
    const existingComment = comments.find(
      (c) => c.author === userInfo?.memberName
    );

    if (existingComment) {
      alert(
        '이미 첨언을 작성하셨습니다. 각 결재자당 1개의 첨언만 작성할 수 있습니다.'
      );
      return;
    }

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

  // 상태 라인 생성
  const approvalLine = [];

  // 기안자 (실제 기안자 이름과 직급)
  if (approvalData.approvalName) {
    approvalLine.push({
      title: '기안자',
      name: approvalData.approvalName,
      date: approvalData.startDate || new Date().toISOString().split('T')[0], // 기안일이 없으면 현재 날짜
      status: 'draft',
    });
  }

  // 0) 헬퍼 / 준비
  const isRejectedDoc = approvalData.approvalStatus === '반려';
  const normalizeId = (v) => {
    if (v === null || v === undefined) return null;
    const s = String(v).trim();
    return s.length ? s : null;
  };
  const nextId = normalizeId(approvalData.nextId);

  // 가장 최근 결재자(한 번만 계산)
  const getLatestSigner = () => {
    let latestId = null;
    let latestTs = null;
    for (let j = 1; j <= 5; j++) {
      const id = approvalData[`signId${j}`];
      const dt = approvalData[`signDate${j}`];
      if (!id || !dt) continue;
      const t = new Date(dt).getTime(); // dt가 ISO가 아닐 수 있으면 파서 보완 필요
      if (latestTs === null || t > latestTs) {
        latestTs = t;
        latestId = id;
      }
    }
    return latestId;
  };

  // signStatus 기반으로 반려자 우선 탐색
  let rejectedBy = null;
  if (isRejectedDoc) {
    for (let k = 1; k <= 5; k++) {
      const id = approvalData[`signId${k}`];
      const st = approvalData[`signStatus${k}`];
      if (id && st === 'REJECTED') {
        rejectedBy = id;
        break;
      }
    }
    // 팀 규칙: 반려 시 nextId = 반려자 → 우선 반영
    if (!rejectedBy && nextId) rejectedBy = nextId;
    // 그래도 없으면 마지막 결재자를 반려자로 추정 (백엔드 로직과 동일)
    if (!rejectedBy) rejectedBy = getLatestSigner();
  }

  // 1) 라인 렌더링
  let seenRejection = false;

  for (let i = 1; i <= 5; i++) {
    const signId = approvalData[`signId${i}`];
    if (!signId) continue;

    const signDate = approvalData[`signDate${i}`] || null;
    const signStatus = approvalData[`signStatus${i}`] || null;

    let status = 'pending';

    if (signStatus === 'APPROVED') status = 'approved';
    else if (signStatus === 'REJECTED') {
      status = 'rejected';
      seenRejection = true;
    } else {
      if (isRejectedDoc) {
        if (rejectedBy && signId === rejectedBy) {
          status = 'rejected';
          seenRejection = true;
        } else if (signDate) {
          status = 'approved';
        } else {
          status = 'cancelled';
        }
      } else if (signDate) {
        status = 'approved';
      }
    }
    if (seenRejection && !signDate && status === 'pending') {
      status = 'cancelled';
    }

    approvalLine.push({
      title: '결재자',
      name: signId,
      date: signDate,
      status, // 'approved' | 'rejected' | 'pending' | 'cancelled'
    });
  }

  // 현재 사용자가 결재자인지 확인
  const isApprover = [
    approvalData.signId1,
    approvalData.signId2,
    approvalData.signId3,
    approvalData.signId4,
    approvalData.signId5,
  ].includes(userInfo?.memberName);

  // 현재 사용자가 이미 결재했는지 확인
  const hasCurrentUserApproved = () => {
    for (let i = 1; i <= 5; i++) {
      const signId = approvalData[`signId${i}`];
      const signDate = approvalData[`signDate${i}`];
      if (signId === userInfo?.memberName && signDate) {
        return true;
      }
    }
    return false;
  };

  return (
    <Box sx={{ p: 3, mt: 3 }}>
      <Container maxWidth="xl" sx={{ mx: 0, px: 0 }}>
        <PageHeader title="기안서 상세" fontSize={{ xs: '20px', sm: '30px' }} />

        <Paper sx={{ p: { xs: 2, sm: 4 }, mt: 3 }}>
          {/* 문서 제목 */}
          <Typography
            variant="h4"
            sx={{
              mb: 3,
              textAlign: 'center',
              fontWeight: 600,
              fontSize: { xs: '20px', sm: '28px' },
            }}
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
                          fontSize: { xs: '12px', sm: '14px' },
                          py: { xs: 1, sm: 1.5 },
                          px: { xs: 2, sm: 3 },
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
                      <TableCell
                        key={index}
                        align="center"
                        sx={{ py: { xs: 1.5, sm: 2 }, px: { xs: 2, sm: 3 } }}
                      >
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 600,
                              fontSize: { xs: '13px', sm: '15px' },
                              color: '#141414',
                            }}
                          >
                            {item.name}
                          </Typography>
                          {item.date &&
                            (item.status === 'approved' ||
                              item.status === 'draft') && (
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: { xs: '11px', sm: '12px' },
                                  display: 'block',
                                  fontWeight: 500,
                                  mt: 0.5,
                                  color: '#1976d2', // 파란색
                                }}
                              >
                                {new Date(item.date).toLocaleDateString()}
                              </Typography>
                            )}
                          {item.date && item.status === 'rejected' && (
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: { xs: '11px', sm: '12px' },
                                display: 'block',
                                fontWeight: 500,
                                mt: 0.5,
                                color: '#d32f2f', // 빨간색
                              }}
                            >
                              {new Date(item.date).toLocaleDateString()}/반려
                            </Typography>
                          )}
                          {!item.date && item.status === 'pending' && (
                            <Typography
                              variant="caption"
                              color="text.disabled"
                              sx={{
                                fontSize: { xs: '11px', sm: '12px' },
                                display: 'block',
                                mt: 0.5,
                              }}
                            >
                              대기
                            </Typography>
                          )}
                          {item.status === 'cancelled' && (
                            <Box sx={{ height: 18, mt: 0.5 }} />
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
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  lineHeight: '1.6',
                  textAlign: 'left',
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
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                    }}
                  >
                    <Typography variant="body2">{fileName}</Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Download />}
                      onClick={() => handleFileDownload(fileName, index)}
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
          <Box sx={{ mb: 2, textAlign: 'left' }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              첨언 (선택사항)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              * 1개의 첨언만 작성할 수 있습니다.
            </Typography>

            {/* 등록된 첨언 목록 */}
            {comments.length > 0 && (
              <Box sx={{ mb: 2 }}>
                {comments.map((commentItem) => (
                  <Paper
                    key={commentItem.id}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      mb: 1.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
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
                placeholder={
                  comments.find((c) => c.author === userInfo?.memberName)
                    ? '이미 첨언을 작성하셨습니다.'
                    : '의견을 입력하세요'
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                variant="outlined"
                disabled={
                  !!comments.find((c) => c.author === userInfo?.memberName) &&
                  !editingComment
                }
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
                    disabled={
                      !comment.trim() ||
                      (!!comments.find(
                        (c) => c.author === userInfo?.memberName
                      ) &&
                        !editingComment)
                    }
                  >
                    등록
                  </Button>
                )}
              </Box>
            </Box>
          </Box>

          {/* 결재 버튼 */}
          <Box
            sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}
          >
            {/* 기안자인 경우 - 기안취소 버튼 */}
            {(() => {
              const isAuthor =
                approvalData.approvalName === userInfo?.memberName;
              const isProgressing = approvalData.approvalStatus === '진행중';
              const isCompleted = approvalData.approvalStatus === '완료';
              const isRejected = approvalData.approvalStatus === '반려';
              const noSecondApproval = !approvalData.signDate2;

              return (
                isAuthor &&
                isProgressing &&
                !isCompleted &&
                !isRejected &&
                noSecondApproval
              );
            })() ? (
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
            ) : null}

            {/* 결재자인 경우 - 승인/반려 버튼 */}
            {(() => {
              const isProgressing = approvalData.approvalStatus === '진행중';
              const isCompleted = approvalData.approvalStatus === '완료';
              const isRejected = approvalData.approvalStatus === '반려';
              const isAuthor =
                approvalData.approvalName === userInfo?.memberName;

              return (
                isApprover &&
                isProgressing &&
                !isCompleted &&
                !isRejected &&
                !isAuthor &&
                !hasCurrentUserApproved()
              );
            })() ? (
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
            ) : null}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ApprovalDetailContent;
