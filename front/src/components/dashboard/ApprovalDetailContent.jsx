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
  Dialog,
  DialogContent,
} from '@mui/material';
import { Download, CheckCircle, Cancel, AttachFile, Close } from '@mui/icons-material';
import { API_URLS } from '../../config/api';
import { apiRequest } from '../../utils/apiHelper';
import PageHeader from '../common/PageHeader';
import { useLanguage } from '../../contexts/LanguageContext';
import SuccessDialog from '../common/SuccessDialog';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';

const ApprovalDetailContent = ({ userInfo }) => {
  const { t, formatDate } = useLanguage();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [approvalData, setApprovalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [comments, setComments] = useState([]); // 등록된 첨언 목록
  const [editingComment, setEditingComment] = useState(null); // 수정 중인 첨언 ID
  const [commentFiles, setCommentFiles] = useState([]); // 첨언 첨부파일

  // 다이얼로그 상태
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isRejectAction, setIsRejectAction] = useState(false);
  const [showDeleteCommentDialog, setShowDeleteCommentDialog] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);

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

        // 첨언 데이터 로드
        const loadedComments = [];
        const data = response.data;

        // 결재자 첨언 로드 (signRemark1~5)
        for (let i = 1; i <= 5; i++) {
          const remarkField = `signRemark${i}`;
          const signIdField = `signId${i}`;
          const signDateField = `signDate${i}`;

          if (data[remarkField] && data[signIdField]) {
            loadedComments.push({
              id: `sign${i}`,
              content: data[remarkField],
              author: data[signIdField],
              date: data[signDateField]
                ? new Date(data[signDateField]).toLocaleString()
                : '',
              type: 'signer',
            });
          }
        }

        // 기안자 첨언 로드
        if (data.drafterRemark) {
          loadedComments.push({
            id: 'drafter',
            content: data.drafterRemark,
            author: data.approvalName,
            date: data.updateDate
              ? new Date(data.updateDate).toLocaleString()
              : '',
            type: 'drafter',
          });
        }

        // 참조자 첨언 로드
        if (data.referenceRemark) {
          loadedComments.push({
            id: 'reference',
            content: data.referenceRemark,
            author: t('referrerLabel'),
            date: data.updateDate
              ? new Date(data.updateDate).toLocaleString()
              : '',
            type: 'reference',
          });
        }

        setComments(loadedComments);
      } else {
        alert(`기안서를 불러올 수 없습니다.\n${response.data || ''}`);
        navigate('/progress-list');
      }
    } catch (error) {
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
        setIsRejectAction(action === 'reject');
        setSuccessMessage(action === 'approve' ? t('approved') : t('rejected'));
        setShowSuccessDialog(true);
        // 데이터 다시 로드해서 결재라인 업데이트
        await loadApprovalDetail();
        // 잠시 후 진행목록으로 이동
        setTimeout(() => {
          navigate('/progress-list');
        }, 1000);
      } else {
        setIsRejectAction(false);
        // 에러 메시지 추출
        let errorMessage = '';
        if (typeof response.data === 'string') {
          errorMessage = response.data;
        } else if (response.data && typeof response.data === 'object') {
          errorMessage =
            response.data.message ||
            response.data.error ||
            JSON.stringify(response.data);
        } else {
          errorMessage = t('approvalFailed');
        }
        // 결재자 관련 에러인지 확인
        if (errorMessage.includes('현재 결재자가 아닙니다')) {
          setSuccessMessage(t('notCurrentApprover'));
        } else {
          setSuccessMessage(`${t('approvalFailed')}\n${errorMessage}`);
        }
        setShowSuccessDialog(true);
      }
    } catch (error) {
      setIsRejectAction(false);
      setSuccessMessage(`${t('approvalFailed')}: ${error.message}`);
      setShowSuccessDialog(true);
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
        alert(response.data || t('draftCancelFailed'));
      }
    } catch (error) {
      alert(`${t('draftCancelFailed')}: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // 파일 다운로드
  const handleFileDownload = (fileName, fileIndex) => {
    // 백엔드에서 요구하는 필드명으로 변환
    let fieldName;
    if (fileIndex === 'signer') {
      fieldName = 'signerAttachFile';
    } else if (fileIndex === 'reference') {
      fieldName = 'referenceAttachFile';
    } else {
      fieldName = `approvalAttachFile${fileIndex + 1}`;
    }
    const downloadUrl = `${API_URLS.APPROVAL_FILE_DOWNLOAD}/${approvalNo}/${fieldName}`;
    window.open(downloadUrl, '_blank');
  };

  // 첨언 파일 선택
  const handleCommentFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // 기안자인지 확인
    const isDrafter = approvalData?.approvalId === userInfo?.memberId;
    
    // 결재자인지 확인
    const isSigner = [
      approvalData?.signId1,
      approvalData?.signId2,
      approvalData?.signId3,
      approvalData?.signId4,
      approvalData?.signId5,
    ].includes(userInfo?.memberName);

    // 기안자: 기안서 첨부파일 + 첨언 첨부파일 합쳐서 최대 5개
    // 결재자/참조자: 최대 1개
    if (isDrafter) {
      // 기안서에 이미 올린 파일 개수
      const existingFileCount = [
        approvalData?.approvalAttachFile1,
        approvalData?.approvalAttachFile2,
        approvalData?.approvalAttachFile3,
        approvalData?.approvalAttachFile4,
        approvalData?.approvalAttachFile5,
      ].filter(Boolean).length;

      const maxFiles = 5;
      const currentCount = existingFileCount + commentFiles.length;
      const availableSlots = maxFiles - currentCount;

      if (availableSlots <= 0) {
        setSuccessMessage(t('maxFilesExceeded5'));
        setShowSuccessDialog(true);
        return;
      }

      const filesToAdd = files.slice(0, availableSlots);
      setCommentFiles((prev) => [...prev, ...filesToAdd]);
    } else {
      // 결재자/참조자는 1개만 가능
      const maxFiles = 1;
      const currentCount = commentFiles.length;
      const availableSlots = maxFiles - currentCount;

      if (availableSlots <= 0) {
        setSuccessMessage(t('maxFilesExceeded1'));
        setShowSuccessDialog(true);
        return;
      }

      const filesToAdd = files.slice(0, availableSlots);
      setCommentFiles((prev) => [...prev, ...filesToAdd]);
    }
    
    // input 초기화 (같은 파일 다시 선택 가능하도록)
    e.target.value = '';
  };

  // 첨언 파일 삭제
  const handleRemoveCommentFile = (index) => {
    setCommentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 첨언 등록
  const handleCommentSubmit = async () => {
    if (!comment.trim() && commentFiles.length === 0) return;

    // 현재 사용자가 이미 첨언을 작성했는지 확인
    const existingComment = comments.find(
      (c) => c.author === userInfo?.memberName
    );

    if (existingComment) {
      setSuccessMessage(t('alreadyCommented'));
      setShowSuccessDialog(true);
      return;
    }

    try {
      const formData = new FormData();
      const dto = { comment: comment.trim() };

      formData.append(
        'dto',
        new Blob([JSON.stringify(dto)], { type: 'application/json' })
      );

      // 첨부파일 추가
      commentFiles.forEach((file) => {
        formData.append('files', file);
      });

      const response = await apiRequest(
        API_URLS.APPROVAL_ADD_COMMENTS(approvalNo),
        {
          method: 'POST',
          body: formData,
        }
      );

      if (response.ok) {
        // 새 첨언 객체 생성 - 올바른 형태로
        const newComment = {
          id: `comment-${Date.now()}`,
          content: comment.trim(),
          author: userInfo?.memberName || '익명',
          date: new Date().toLocaleString(),
          type: 'new',
          files: commentFiles.map((f) => f.name), // 첨부파일명 표시용
        };

        setComments((prev) => [...prev, newComment]); // UI 즉시 반영
        setComment(''); // 입력창 초기화
        setCommentFiles([]); // 파일 초기화
        setSuccessMessage(t('commentRegistered'));
        setShowSuccessDialog(true);
      } else {
        setSuccessMessage(response.data || t('commentRegistrationFailed'));
        setShowSuccessDialog(true);
      }
    } catch (err) {
      setSuccessMessage(t('serverError'));
      setShowSuccessDialog(true);
    }
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
  const handleCommentUpdate = async () => {
    if (!comment.trim() || !editingComment) return;

    try {
      const response = await apiRequest(
        API_URLS.APPROVAL_EDIT_COMMENT(approvalNo),
        {
          method: 'POST',
          body: JSON.stringify({ comment: comment.trim() }),
        }
      );

      if (response.ok) {
        setComments(
          comments.map((c) =>
            c.id === editingComment
              ? { ...c, content: comment.trim(), date: new Date().toLocaleString() }
              : c
          )
        );
        setComment('');
        setEditingComment(null);
        setSuccessMessage(t('commentRegistered'));
        setShowSuccessDialog(true);
      } else {
        setSuccessMessage(response.data || t('commentRegistrationFailed'));
        setShowSuccessDialog(true);
      }
    } catch (err) {
      setSuccessMessage(t('serverError'));
      setShowSuccessDialog(true);
    }
  };

  // 첨언 삭제 확인 다이얼로그 열기
  const handleCommentDelete = (commentId) => {
    setCommentToDelete(commentId);
    setShowDeleteCommentDialog(true);
  };

  // 첨언 삭제 확인
  const handleConfirmDeleteComment = async () => {
    if (commentToDelete) {
      try {
        const response = await apiRequest(
          API_URLS.APPROVAL_DELETE_COMMENT(approvalNo),
          {
            method: 'POST',
          }
        );

        if (response.ok) {
          setComments(comments.filter((c) => c.id !== commentToDelete));
          setShowDeleteCommentDialog(false);
          setCommentToDelete(null);
          setSuccessMessage(t('commentDeleted'));
          setShowSuccessDialog(true);
        } else {
          setShowDeleteCommentDialog(false);
          setSuccessMessage(response.data || t('commentRegistrationFailed'));
          setShowSuccessDialog(true);
        }
      } catch (err) {
        setShowDeleteCommentDialog(false);
        setSuccessMessage(t('serverError'));
        setShowSuccessDialog(true);
      }
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
      title: t('drafterLabel'),
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
      title: t('approverLabel'),
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
        <PageHeader
          title={t('approvalDetail')}
          fontSize={{ xs: '20px', sm: '30px' }}
        />

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
                                {formatDate(item.date)}
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
                              {formatDate(item.date)}/반려
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
                              {t('waiting')}
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
              {t('approvalNo')}: {approvalNo}
            </Typography>
          </Box>

          {/* 문서 내용 */}
          <Box sx={{ mb: 4 }}>
            <Paper variant="outlined" sx={{ p: 3, minHeight: 200 }}>
              <div
                dangerouslySetInnerHTML={{
                  __html: approvalData.approvalDocument || t('noContent'),
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
                {t('referrerLabel')}
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
              {t('attachments')}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {/* 기안서 첨부파일 (기안자 첨언 파일 포함) */}
              {[
                { file: approvalData.approvalAttachFile1, info: approvalData.approvalAttachInfo1, index: 0 },
                { file: approvalData.approvalAttachFile2, info: approvalData.approvalAttachInfo2, index: 1 },
                { file: approvalData.approvalAttachFile3, info: approvalData.approvalAttachInfo3, index: 2 },
                { file: approvalData.approvalAttachFile4, info: approvalData.approvalAttachInfo4, index: 3 },
                { file: approvalData.approvalAttachFile5, info: approvalData.approvalAttachInfo5, index: 4 },
              ]
                .filter((item) => item.file)
                .map((item) => (
                  <Box
                    key={item.index}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">{item.file}</Typography>
                      {item.info && (
                        <Chip label={item.info} size="small" variant="outlined" color="primary" />
                      )}
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Download />}
                      onClick={() => handleFileDownload(item.file, item.index)}
                    >
                      {t('download')}
                    </Button>
                  </Box>
                ))}
              
              {/* 결재자 첨언 첨부파일 */}
              {approvalData.signerAttachFile && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">{approvalData.signerAttachFile}</Typography>
                    <Chip label={approvalData.signerAttachInfo || '결재자첨언'} size="small" variant="outlined" color="secondary" />
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Download />}
                    onClick={() => handleFileDownload(approvalData.signerAttachFile, 'signer')}
                  >
                    {t('download')}
                  </Button>
                </Box>
              )}
              
              {/* 참조자 첨언 첨부파일 */}
              {approvalData.referenceAttachFile && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2">{approvalData.referenceAttachFile}</Typography>
                    <Chip label={approvalData.referenceAttachInfo || '참조자첨언'} size="small" variant="outlined" color="info" />
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Download />}
                    onClick={() => handleFileDownload(approvalData.referenceAttachFile, 'reference')}
                  >
                    {t('download')}
                  </Button>
                </Box>
              )}
              
              {/* 첨부파일 없음 */}
              {!approvalData.approvalAttachFile1 && 
               !approvalData.signerAttachFile && 
               !approvalData.referenceAttachFile && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: 'left' }}
                >
                  {t('noAttachments')}
                </Typography>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 4 }} />
          {/* 첨언 */}
          <Box sx={{ mb: 2, textAlign: 'left' }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              {t('comments')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              * {t('oneCommentOnly')}
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
                    {/* 본인이 작성한 첨언만 수정/삭제 가능 */}
                    {commentItem.author === userInfo?.memberName && (
                      <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleCommentEdit(commentItem.id)}
                          disabled={editingComment === commentItem.id}
                        >
                          {t('edit')}
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          onClick={() => handleCommentDelete(commentItem.id)}
                        >
                          {t('delete')}
                        </Button>
                      </Box>
                    )}
                  </Paper>
                ))}
              </Box>
            )}

            {/* 첨언 입력 */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                <TextField
                  fullWidth
                  multiline
                  rows={1}
                  placeholder={
                    comments.find((c) => c.author === userInfo?.memberName)
                      ? t('alreadyCommentedPlaceholder')
                      : t('enterComment')
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
                  {/* 파일 첨부 버튼 */}
                  <input
                    type="file"
                    id="comment-file-input"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleCommentFileChange}
                    disabled={
                      !!comments.find((c) => c.author === userInfo?.memberName) &&
                      !editingComment
                    }
                  />
                  <label htmlFor="comment-file-input">
                    <Button
                      variant="outlined"
                      component="span"
                      sx={{ minWidth: 56, height: '56px', px: 1.5 }}
                      disabled={
                        !!comments.find((c) => c.author === userInfo?.memberName) &&
                        !editingComment
                      }
                    >
                      <AttachFile />
                    </Button>
                  </label>
                  {editingComment ? (
                    <>
                      <Button
                        variant="contained"
                        color="primary"
                        sx={{ minWidth: 80, height: '56px' }}
                        onClick={handleCommentUpdate}
                        disabled={!comment.trim()}
                      >
                        {t('edit')}
                      </Button>
                      <Button
                        variant="outlined"
                        sx={{ minWidth: 80, height: '56px' }}
                        onClick={handleCommentCancel}
                      >
                        {t('cancel')}
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      color="primary"
                      sx={{ minWidth: 100, height: '56px' }}
                      onClick={handleCommentSubmit}
                      disabled={
                        (!comment.trim() && commentFiles.length === 0) ||
                        (!!comments.find(
                          (c) => c.author === userInfo?.memberName
                        ) &&
                          !editingComment)
                      }
                    >
                      {t('register')}
                    </Button>
                  )}
                </Box>
              </Box>

              {/* 선택된 첨부파일 목록 */}
              {commentFiles.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {commentFiles.map((file, index) => (
                    <Chip
                      key={index}
                      label={file.name}
                      onDelete={() => handleRemoveCommentFile(index)}
                      deleteIcon={<Close />}
                      variant="outlined"
                      size="small"
                      sx={{ maxWidth: 250 }}
                    />
                  ))}
                </Box>
              )}

              {/* 첨부파일 안내 */}
              <Typography variant="caption" color="text.secondary">
                * {approvalData?.approvalId === userInfo?.memberId
                  ? t('drafterFileLimit')
                  : t('signerFileLimit')}
              </Typography>
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
                {t('cancelDraft')}
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
                  {t('approve')}
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
                  {t('reject')}
                </Button>
              </>
            ) : null}
          </Box>
        </Paper>

        {/* 첨언 삭제 확인 다이얼로그 */}
        <Dialog
          open={showDeleteCommentDialog}
          onClose={() => setShowDeleteCommentDialog(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogContent sx={{ padding: 3, textAlign: 'center' }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                mb: 2,
              }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  backgroundColor: '#f44336',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Cancel sx={{ color: 'white', fontSize: 30 }} />
              </Box>
            </Box>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              {t('confirmDeleteComment')}
            </Typography>
            <Box
              sx={{ display: 'flex', gap: 1, justifyContent: 'center', mt: 2 }}
            >
              <Button
                onClick={handleConfirmDeleteComment}
                variant="contained"
                sx={{
                  backgroundColor: '#f44336',
                  '&:hover': {
                    backgroundColor: '#d32f2f',
                  },
                  borderRadius: 1.5,
                  px: 4,
                  py: 1,
                }}
              >
                {t('delete')}
              </Button>
              <Button
                onClick={() => setShowDeleteCommentDialog(false)}
                variant="outlined"
                sx={{
                  borderRadius: 1.5,
                  px: 4,
                  py: 1,
                }}
              >
                {t('cancel')}
              </Button>
            </Box>
          </DialogContent>
        </Dialog>

        {/* 성공 다이얼로그 */}
        <SuccessDialog
          open={showSuccessDialog}
          onClose={() => {
            setShowSuccessDialog(false);
            setIsRejectAction(false);
          }}
          title={successMessage === t('notCurrentApprover') ? '' : t('confirm')}
          message={successMessage}
          buttonText={t('confirm')}
          isError={isRejectAction || successMessage === t('notCurrentApprover')}
        />
      </Container>
    </Box>
  );
};

export default ApprovalDetailContent;
