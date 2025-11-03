import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Container,
  Autocomplete,
} from '@mui/material';
import { AttachFile, Description } from '@mui/icons-material';
import { API_URLS } from '../../config/api';
import { apiRequest } from '../../utils/apiHelper';
import PageHeader from '../common/PageHeader';
import SaveConfirmDialog from '../common/SaveConfirmDialog';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';
import SuccessDialog from '../common/SuccessDialog';

const ApprovalWriteContent = ({ userInfo, onSaveBeforeNew }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    formNo: '',
    formTitle: '',
    approvalTitle: '',
    approvalType: '',
    approvalDocument: '',
    signId1: '',
    signId2: '',
    signId3: '',
    signId4: '',
    signId5: '',
    referenceId: '',
  });

  const [attachedFiles, setAttachedFiles] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [formTemplates, setFormTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [members, setMembers] = useState([]);
  const [selectedApprovers, setSelectedApprovers] = useState([]);
  const [selectedReferrers, setSelectedReferrers] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  // 기존 기안서 데이터 로드
  const loadExistingApproval = async (approvalNo) => {
    try {
      const response = await apiRequest(
        `${API_URLS.APPROVAL_GET_DRAFT}/${approvalNo}`,
        {
          method: 'GET',
        }
      );

      if (response.ok) {
        const data = response.data;

        // 폼 데이터 설정
        setFormData({
          formNo: data.formNo.toString(),
          formTitle: data.formTitle,
          approvalTitle: data.approvalTitle,
          approvalType: data.aprovalType || '',
          approvalDocument: data.approvalDocument || '',
          signId1: data.signId1 || '',
          signId2: data.signId2 || '',
          signId3: data.signId3 || '',
          signId4: data.signId4 || '',
          signId5: data.signId5 || '',
          referenceId: data.referenceId || '',
        });

        // 선택된 양식 설정
        const selectedFormData = {
          id: data.formNo,
          title: data.formTitle,
          type: data.aprovalType || '',
          template: data.approvalDocument || '',
        };
        setSelectedForm(selectedFormData);

        // 결재자와 참조자 설정
        const approvers = [];
        const referrers = [];

        // 결재자 설정
        [data.signId1, data.signId2, data.signId3, data.signId4, data.signId5]
          .filter(Boolean)
          .forEach((signId) => {
            const member = members.find((m) => m.memberName === signId);
            if (member) approvers.push(member);
          });
        setSelectedApprovers(approvers);

        // 참조자 설정
        if (data.referenceId) {
          const referrerNames = data.referenceId.split(',');
          referrerNames.forEach((name) => {
            const member = members.find((m) => m.memberName === name.trim());
            if (member) referrers.push(member);
          });
          setSelectedReferrers(referrers);
        }

        // 첨부파일 정보 복원 (파일명만 표시)
        const existingFiles = [];
        [
          data.approvalAttachFile1,
          data.approvalAttachFile2,
          data.approvalAttachFile3,
          data.approvalAttachFile4,
          data.approvalAttachFile5,
        ]
          .filter(Boolean)
          .forEach((fileName) => {
            // 기존 파일을 File 객체로 생성 (실제 파일은 아니지만 UI 표시용)
            const file = new File([''], fileName, {
              type: 'application/octet-stream',
            });
            existingFiles.push(file);
          });
        setAttachedFiles(existingFiles);
      } else {
        console.error('기존 기안서 로드 실패:', response.status);
      }
    } catch (error) {
      console.error('기존 기안서 로드 실패:', error);
    }
  };

  // 백엔드에서 양식 목록 가져오기
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const response = await apiRequest(API_URLS.APPROVAL_FORMS, {
          method: 'GET',
        });
        if (response.ok) {
          const backendForms = response.data.map((form) => ({
            id: form.formNo,
            title: form.formTitle,
            type: form.formType,
            template: '',
          }));
          setFormTemplates(backendForms);
        } else {
          console.error('양식 목록 가져오기 실패:', response.status);
        }
      } catch (error) {
        console.error('양식 목록 가져오기 실패:', error);
        setFormTemplates(getDefaultFormTemplates());
      }
    };

    const fetchMembers = async () => {
      try {
        const response = await apiRequest(API_URLS.MEMBER_ACTIVE_MEMBERS, {
          method: 'GET',
        });
        if (response.ok) {
          setMembers(response.data);
        } else {
          console.error('회원 목록 가져오기 실패:', response.status);
        }
      } catch (error) {
        console.error('회원 목록 가져오기 실패:', error);
      }
    };

    fetchForms();
    fetchMembers();
  }, []);

  // URL 파라미터에서 기안서 번호 확인하여 기존 데이터 로드
  useEffect(() => {
    const approvalNo = searchParams.get('approvalNo');

    if (approvalNo && members.length > 0) {
      loadExistingApproval(approvalNo);
      setHasUnsavedChanges(false); // 기존 데이터 로드 시에는 변경사항 없음
    } else if (!approvalNo) {
      setFormData({
        formNo: '',
        formTitle: '',
        approvalTitle: '',
        approvalType: '',
        approvalDocument: '',
        signId1: '',
        signId2: '',
        signId3: '',
        signId4: '',
        signId5: '',
        referenceId: '',
      });
      setSelectedApprovers([]);
      setSelectedReferrers([]);
      setAttachedFiles([]);
      setSelectedForm(null);
      setHasUnsavedChanges(false); // 초기화 시에는 변경사항 없음
    }
  }, [searchParams, members]);

  // 내용 변경 감지
  useEffect(() => {
    setHasUnsavedChanges(true);
  }, [formData, attachedFiles, selectedApprovers, selectedReferrers]);

  // 기안중(임시저장 편집) 진입 시 플래그 설정, 종료/저장 시 해제
  useEffect(() => {
    const approvalNo = searchParams.get('approvalNo');
    if (approvalNo) {
      sessionStorage.setItem('unsavedDraft', '1');
    }
    return () => {
      sessionStorage.removeItem('unsavedDraft');
    };
  }, []);

  // 브라우저 뒤로가기/앞으로가기 감지
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // 브라우저 뒤로가기(popstate) 차단 및 다이얼로그 표출
  useEffect(() => {
    const handlePopState = () => {
      // 임시저장 편집 중이면 뒤로가기 차단하고 다이얼로그 표시
      if (sessionStorage.getItem('unsavedDraft') === '1') {
        history.pushState(null, '', location.href);
        setPendingNavigation(-1);
        setShowSaveDialog(true);
      }
    };
    // 현재 상태를 한 번 더 쌓아서 즉시 뒤로가기에 대비
    history.pushState(null, '', location.href);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const getDefaultFormTemplates = () => [
    {
      id: 1,
      title: '[공통] 기안서',
      template: `
        <h3>품의 제목</h3>
        <p>아래와 같이 기안 상신 하오니 검토 후 재가하여 주시기 바랍니다.</p>
        <table border="1" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px;"><strong>기안목적</strong></td>
            <td style="padding: 10px;"><strong>예상 효과</strong></td>
          </tr>
          <tr>
            <td style="padding: 10px;">&nbsp;</td>
            <td style="padding: 10px;">1.<br>2.</td>
          </tr>
        </table>
        <h3>기안 내용</h3>
        <p>&nbsp;</p>
      `,
    },
    {
      id: 2,
      title: '[휴가] 휴가신청서',
      template: `
        <h3>휴가신청서</h3>
        <table border="1" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px;"><strong>신청자</strong></td>
            <td style="padding: 10px;">&nbsp;</td>
            <td style="padding: 10px;"><strong>부서</strong></td>
            <td style="padding: 10px;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding: 10px;"><strong>휴가종류</strong></td>
            <td style="padding: 10px;">&nbsp;</td>
            <td style="padding: 10px;"><strong>기간</strong></td>
            <td style="padding: 10px;">&nbsp;</td>
          </tr>
        </table>
        <h3>휴가 사유</h3>
        <p>&nbsp;</p>
      `,
    },
    {
      id: 3,
      title: '[출장] 출장신청서',
      template: `
        <h3>출장신청서</h3>
        <table border="1" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px;"><strong>출장목적</strong></td>
            <td style="padding: 10px;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding: 10px;"><strong>출장지</strong></td>
            <td style="padding: 10px;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding: 10px;"><strong>출장기간</strong></td>
            <td style="padding: 10px;">&nbsp;</td>
          </tr>
        </table>
        <h3>출장 내용</h3>
        <p>&nbsp;</p>
      `,
    },
  ];

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleFormSelect = async (form) => {
    setSelectedForm(form);
    setFormData({
      ...formData,
      formNo: form.id.toString(),
      formTitle: form.title,
    });

    // 백엔드에서 양식 템플릿 가져오기
    if (form.id) {
      try {
        const response = await apiRequest(
          `${API_URLS.APPROVAL_FORM_DETAIL}/${form.id}`,
          {
            method: 'GET',
          }
        );
        if (response.ok) {
          // formDocument가 JSON 형식이면 파싱해서 HTML로 변환
          let documentContent = '';
          try {
            const parsed = JSON.parse(response.data.formDocument || '{}');
            const contents = parsed.contents || [];
            if (contents.length > 0) {
              // JSON 배열을 HTML로 변환
              documentContent = contents
                .map((item, index) => `<p>${index + 1}. ${item}</p>`)
                .join('\n');
            } else {
              documentContent = response.data.formDocument || '';
            }
          } catch {
            // JSON이 아니면 그대로 사용
            documentContent = response.data.formDocument || '';
          }

          setFormData((prev) => ({
            ...prev,
            approvalDocument: documentContent,
          }));
        }
      } catch (error) {
        console.error('양식 템플릿 가져오기 실패:', error);
        setFormData((prev) => ({
          ...prev,
          approvalDocument: form.template || '',
        }));
      }
    }

    setFormDialogOpen(false);
  };

  const handleFormDialogOpen = () => {
    setFormDialogOpen(true);
  };

  const handleFormDialogClose = () => {
    setFormDialogOpen(false);
  };

  // 검색 필터링
  const filteredForms = formTemplates.filter(
    (form) =>
      form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setAttachedFiles([...attachedFiles, ...files]);
  };

  const removeFile = (index) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  const handleSave = useCallback(async () => {
    try {
      setLoading(true);

      // 임시저장 필수 필드 검증 (양식과 제목만)
      if (
        !formData.formNo ||
        formData.formNo.trim() === '' ||
        !formData.approvalTitle ||
        formData.approvalTitle.trim() === ''
      ) {
        alert('양식과 제목을 선택해주세요.');
        return false;
      }

      // 임시저장은 결재자 검증 제거

      const approvalNo = searchParams.get('approvalNo');
      const formDataToSend = new FormData();
      const approvalData = {
        formNo: parseInt(formData.formNo),
        approvalTitle: formData.approvalTitle,
        approvalDocument: formData.approvalDocument,
        signId1: formData.signId1,
        signId2: formData.signId2,
        signId3: formData.signId3,
        signId4: formData.signId4,
        signId5: formData.signId5,
        referenceId: formData.referenceId,
      };

      // 기존 기안서가 있으면 번호 추가
      if (approvalNo) {
        approvalData.approvalNo = parseInt(approvalNo);
      }

      // 첨부파일 추가 (새로 업로드한 파일만)
      attachedFiles.forEach((file) => {
        if (file.size > 0) {
          // 새로 업로드한 파일만 (기존 파일은 size가 0)
          formDataToSend.append('files', file);
        }
      });

      formDataToSend.append('approvalDto', JSON.stringify(approvalData));
      const response = await apiRequest(API_URLS.APPROVAL_TEMPORARY_DRAFT, {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        setShowSuccessDialog(true);
        setHasUnsavedChanges(false);
        return true;
      } else {
        alert(
          `임시저장에 실패했습니다. (${response.status}: ${response.statusText})`
        );
        return false;
      }
    } catch (error) {
      console.error('임시저장 실패:', error);
      alert('임시저장에 실패했습니다: ' + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [formData, attachedFiles, searchParams, navigate]);

  // 외부에서 저장 함수 호출할 수 있도록 등록
  useEffect(() => {
    if (onSaveBeforeNew) {
      onSaveBeforeNew(handleSave);
    }
  }, [onSaveBeforeNew, handleSave]);

  // 다이얼로그 핸들러 함수들
  const handleSaveChoice = async (choice) => {
    if (choice === 'save') {
      const success = await handleSave();
      if (success) {
        setHasUnsavedChanges(false);
        sessionStorage.removeItem('unsavedDraft');
        if (pendingNavigation === -1) {
          navigate('/progress-list');
        } else if (pendingNavigation) {
          navigate(pendingNavigation);
        }
      }
      // 저장 실패 시 다이얼로그는 그대로 유지
      if (!success) {
        return;
      }
    } else if (choice === 'discard') {
      setHasUnsavedChanges(false);
      sessionStorage.removeItem('unsavedDraft');
      if (pendingNavigation === -1) {
        navigate('/progress-list');
      } else if (pendingNavigation) {
        navigate(pendingNavigation);
      }
    }
    // cancel의 경우 아무것도 하지 않고 다이얼로그만 닫기

    setShowSaveDialog(false);
    setPendingNavigation(null);
  };

  const handleCancel = async () => {
    // 삭제 확인 다이얼로그 표시
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    const approvalNo = searchParams.get('approvalNo');
    if (approvalNo) {
      // 임시저장된 문서가 있는 경우 - 완전 삭제
      try {
        const response = await apiRequest(
          `${API_URLS.APPROVAL_DELETE}/${approvalNo}`,
          {
            method: 'DELETE',
          }
        );

        if (response.ok) {
          navigate('/progress-list');
        } else {
          alert(
            `문서 삭제에 실패했습니다. (${response.status}: ${response.statusText})`
          );
        }
      } catch (error) {
        console.error('문서 삭제 실패:', error);
        alert('문서 삭제에 실패했습니다: ' + error.message);
      }
    } else {
      setFormData({
        formNo: '',
        formTitle: '',
        approvalTitle: '',
        approvalType: '',
        approvalDocument: '',
        signId1: '',
        signId2: '',
        signId3: '',
        signId4: '',
        signId5: '',
        referenceId: '',
      });
      setSelectedApprovers([]);
      setSelectedReferrers([]);
      setAttachedFiles([]);
      setSelectedForm(null);
      setHasUnsavedChanges(false);
    }
    setShowDeleteDialog(false);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      // 필수 필드 검증
      if (
        !formData.formNo ||
        formData.formNo.trim() === '' ||
        !formData.approvalTitle ||
        formData.approvalTitle.trim() === ''
      ) {
        alert('양식과 제목을 선택해주세요.');
        return;
      }

      // 결재자 필수 검증
      if (selectedApprovers.length === 0) {
        alert('결재자를 최소 1명 이상 선택해주세요.');
        return;
      }

      const approvalNo = searchParams.get('approvalNo');
      const formDataToSend = new FormData();
      const approvalData = {
        formNo: parseInt(formData.formNo),
        approvalTitle: formData.approvalTitle,
        approvalDocument: formData.approvalDocument,
        signId1: formData.signId1,
        signId2: formData.signId2,
        signId3: formData.signId3,
        signId4: formData.signId4,
        signId5: formData.signId5,
        referenceId: formData.referenceId,
      };

      // 기존 기안서가 있으면 번호 추가
      if (approvalNo) {
        approvalData.approvalNo = parseInt(approvalNo);
      }

      formDataToSend.append('approvalDto', JSON.stringify(approvalData));

      // 첨부파일 추가 (새로 업로드한 파일만)
      attachedFiles.forEach((file) => {
        if (file.size > 0) {
          // 새로 업로드한 파일만 (기존 파일은 size가 0)
          formDataToSend.append('files', file);
        }
      });

      const response = await apiRequest(API_URLS.APPROVAL_ADD_DRAFT, {
        method: 'POST',
        body: formDataToSend,
      });

      if (response.ok) {
        setIsSubmitSuccess(true);
        setShowSuccessDialog(true);
        setHasUnsavedChanges(false);
      } else {
        console.error('제출 실패 상세:', response);
        alert(
          `기안서 제출에 실패했습니다. (${response.status}: ${
            response.statusText
          })\n에러: ${response.data || '알 수 없는 오류'}`
        );
      }
    } catch (error) {
      console.error('기안서 제출 실패:', error);
      alert('기안서 제출에 실패했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, mt: 3 }}>
      <Container maxWidth="xl" sx={{ mx: 0, px: 0 }}>
        <PageHeader title="기안서 작성" fontSize="30px" />

        <Grid container spacing={3} alignItems="stretch" wrap="wrap">
          <Grid
            item
            sx={{
              flex: {
                xs: '1 1 100%',
                md: '0 0 380px',
              },
              maxWidth: {
                xs: '100%',
                md: '380px',
              },
              display: 'flex',
            }}
          >
            <Paper
              sx={{
                p: 3,
                borderRadius: 2,
                flex: 1,
                height: '100%',
                textAlign: 'left',
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                기안서 정보
              </Typography>

              {/* 양식번호 */}
              <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="양식번호"
                  value={formData.formNo}
                  onChange={handleInputChange('formNo')}
                  variant="outlined"
                  disabled
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                />
                <TextField
                  fullWidth
                  label="양식제목"
                  value={formData.formTitle}
                  onChange={handleInputChange('formTitle')}
                  variant="outlined"
                  disabled
                  sx={{
                    flex: 1,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleFormDialogOpen}
                  startIcon={<Description />}
                  sx={{
                    height: '50px',
                    justifyContent: 'center',
                    color: '#1976d2',
                    fontSize: '16px',

                    borderColor: '#1976d2',
                    '&:hover': {
                      borderColor: '#1565c0',
                      backgroundColor: '#f3f8ff',
                    },
                  }}
                >
                  {selectedForm ? selectedForm.title : '양 식 선 택'}
                </Button>
              </Box>

              <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  label="제목"
                  placeholder="기안서 제목을 입력하세요"
                  value={formData.approvalTitle}
                  onChange={handleInputChange('approvalTitle')}
                  variant="outlined"
                  sx={{
                    flex: 2,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#fff',
                    },
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                <TextField
                  fullWidth
                  label="일자"
                  type="date"
                  value={new Date().toISOString().split('T')[0]}
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  sx={{
                    flex: 1,

                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                  disabled
                />

                {/* 기안자 */}
                <TextField
                  fullWidth
                  label="기안자"
                  value={userInfo?.memberName}
                  variant="outlined"
                  disabled
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      backgroundColor: '#f5f5f5',
                    },
                  }}
                />
              </Box>
              <Box sx={{ mb: 2 }}>
                <Autocomplete
                  multiple
                  options={members.filter(
                    (member) => member.memberId !== userInfo?.memberId
                  )}
                  getOptionLabel={(option) =>
                    `${option.memberName} (${option.memberDepartment})`
                  }
                  value={selectedApprovers}
                  onChange={(event, newValue) => {
                    if (newValue.length > 5) {
                      alert('결재자는 최대 5명까지 선택 가능합니다.');
                      return;
                    }
                    setSelectedApprovers(newValue);
                    setFormData({
                      ...formData,
                      signId1: newValue[0]?.memberName || '',
                      signId2: newValue[1]?.memberName || '',
                      signId3: newValue[2]?.memberName || '',
                      signId4: newValue[3]?.memberName || '',
                      signId5: newValue[4]?.memberName || '',
                    });
                  }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.memberId}
                        label={option.memberName}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="결재자"
                      placeholder="결재자 선택 (최대 5명)"
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#fff',
                        },
                      }}
                    />
                  )}
                />
              </Box>

              {/* 참조자 */}
              <Box sx={{ mb: 2 }}>
                <Autocomplete
                  multiple
                  options={members.filter(
                    (member) => member.memberId !== userInfo?.memberId
                  )}
                  getOptionLabel={(option) =>
                    `${option.memberName} (${option.memberDepartment})`
                  }
                  value={selectedReferrers}
                  onChange={(event, newValue) => {
                    setSelectedReferrers(newValue);
                    const referrerNames = newValue
                      .map((member) => member.memberName)
                      .join(',');
                    setFormData({
                      ...formData,
                      referenceId: referrerNames,
                    });
                  }}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        {...getTagProps({ index })}
                        key={option.memberId}
                        label={option.memberName}
                        color="secondary"
                        variant="outlined"
                        size="small"
                      />
                    ))
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="참조자"
                      placeholder="참조자 선택"
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: '#fff',
                        },
                      }}
                    />
                  )}
                />
              </Box>

              {/* 첨부파일 */}
              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, fontWeight: 600, color: '#666' }}
                >
                  첨부파일
                </Typography>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <Box
                  sx={{
                    border: '1px dashed #1976d2',
                    borderRadius: 2,
                    p: 3,
                    textAlign: 'center',
                    backgroundColor: '#f8f9ff',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: '#f0f4ff',
                      borderColor: '#1565c0',
                    },
                  }}
                  onClick={() => document.getElementById('file-upload').click()}
                >
                  <AttachFile sx={{ fontSize: 40, color: '#1976d2', mb: 1 }} />
                  <Typography
                    variant="body2"
                    sx={{ color: '#1976d2', fontWeight: 600, mb: 0.5 }}
                  >
                    파일 선택
                  </Typography>
                </Box>
                {attachedFiles.length > 0 && (
                  <Box
                    sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}
                  >
                    {attachedFiles.map((file, index) => (
                      <Chip
                        key={index}
                        label={file.name}
                        onDelete={() => removeFile(index)}
                        color={file.size === 0 ? 'default' : 'primary'} // 기존 파일은 회색, 새 파일은 파란색
                        variant="outlined"
                        size="small"
                        sx={{
                          '& .MuiChip-deleteIcon': {
                            color: file.size === 0 ? '#666' : '#1976d2',
                          },
                        }}
                      />
                    ))}
                  </Box>
                )}
              </Box>

              {/* 버튼 */}
              <Box sx={{ display: 'flex', gap: 2, flexDirection: 'row' }}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{
                    height: '50px',

                    fontWeight: 700,
                    borderRadius: '2px',
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    '&:hover': {
                      borderColor: '#1565c0',
                      backgroundColor: '#f3f8ff',
                    },
                  }}
                >
                  {loading ? '저장 중...' : '저장'}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleSave}
                  disabled={loading}
                  sx={{
                    height: '50px',
                    fontWeight: 700,
                    borderRadius: '2px',
                    borderColor: '#9c27b0',
                    color: '#9c27b0',
                    '&:hover': {
                      borderColor: '#7b1fa2',
                      backgroundColor: '#faf5ff',
                    },
                  }}
                >
                  임시저장
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleCancel}
                  sx={{
                    height: '50px',
                    fontWeight: 700,
                    borderRadius: '2px',
                    borderColor: '#f44336',
                    color: '#f44336',
                    '&:hover': {
                      borderColor: '#d32f2f',
                      backgroundColor: '#fff4f3',
                    },
                  }}
                >
                  {searchParams.get('approvalNo') ? '삭제' : '초기화'}
                </Button>
              </Box>
            </Paper>
          </Grid>

          {/* 오른쪽 패널 - 에디터 */}
          <Grid
            item
            sx={{
              flex: {
                xs: '1 1 100%',
                md: '1 1 520px',
              },
              minWidth: {
                xs: 0,
                md: 520,
              },
              display: 'flex',
            }}
          >
            <Paper
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                height: '100%',
                width: '100%',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  p: 2,
                  fontWeight: 600,
                  borderBottom: '1px solid #e0e0e0',
                  backgroundColor: '#f8f9fa',
                }}
              >
                내용
              </Typography>
              <Box sx={{ p: 2, height: 'calc(100% - 56px)' }}>
                <TextField
                  fullWidth
                  multiline
                  rows={20}
                  value={formData.approvalDocument}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      approvalDocument: e.target.value,
                    })
                  }
                  placeholder="내용을 입력하세요"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '100%',
                      alignItems: 'flex-start',
                    },
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* 양식 선택 팝업창 */}
        <Dialog
          open={formDialogOpen}
          onClose={handleFormDialogClose}
          maxWidth="md"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle
            sx={{
              backgroundColor: '#f8f9fa',
              borderBottom: '1px solid #e0e0e0',
              mb: 3,
            }}
          >
            <Typography
              component="div"
              sx={{ fontWeight: 600, fontSize: '1.25rem' }}
            >
              양식 선택
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
              사용할 양식을 선택하세요. 선택한 양식의 내용이 에디터에
              로드됩니다.
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ p: 3 }}>
            {/* 검색 */}
            <TextField
              fullWidth
              placeholder="검색어를 입력하세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  backgroundColor: '#f8f9fa',
                },
              }}
            />

            {/* 양식 목록 테이블 */}
            <TableContainer
              sx={{ borderRadius: 1, border: '1px solid #e0e0e0' }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>순번</TableCell>
                    <TableCell>양식번호</TableCell>
                    <TableCell>양식제목</TableCell>
                    <TableCell>구분</TableCell>
                    <TableCell>선택</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredForms.map((form, index) => (
                    <TableRow
                      key={form.id}
                      sx={{
                        '&:hover': { backgroundColor: '#f8f9fa' },
                        '&:nth-of-type(even)': { backgroundColor: '#fafafa' },
                      }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {form.id.toString().padStart(2, '0')}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>
                        {form.title}
                      </TableCell>
                      <TableCell>{form.type}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleFormSelect(form)}
                          sx={{
                            minWidth: '60px',
                            backgroundColor: '#1976d2',
                            '&:hover': { backgroundColor: '#1565c0' },
                          }}
                        >
                          선택
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>

          <DialogActions
            sx={{
              p: 3,
              backgroundColor: '#f8f9fa',
              borderTop: '1px solid #e0e0e0',
              justifyContent: 'center',
            }}
          >
            <Button
              onClick={handleFormDialogClose}
              variant="outlined"
              sx={{
                minWidth: '109px',
                height: '30px',
                fontWeight: 600,
                borderColor: '#80858A',
                color: '#80858A',
                '&:hover': {
                  borderColor: '#1565c0',
                  backgroundColor: '#f3f8ff',
                },
              }}
            >
              닫기
            </Button>
          </DialogActions>
        </Dialog>

        {/* SaveConfirmDialog */}
        <SaveConfirmDialog
          open={showSaveDialog}
          onClose={() => setShowSaveDialog(false)}
          onConfirm={handleSaveChoice}
        />

        {/* DeleteConfirmDialog */}
        <DeleteConfirmDialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteConfirm}
          isExistingDocument={!!searchParams.get('approvalNo')}
        />

        {/* SuccessDialog */}
        <SuccessDialog
          open={showSuccessDialog}
          onClose={() => {
            setShowSuccessDialog(false);
            setIsSubmitSuccess(false);
            setLoading(false);
            navigate('/progress-list');
          }}
          title={isSubmitSuccess ? '제출 완료' : '저장 완료'}
          message={
            isSubmitSuccess
              ? '기안서가 제출되었습니다.'
              : '저장이 완료되었습니다.'
          }
          buttonText="확인"
        />
      </Container>
    </Box>
  );
};

export default ApprovalWriteContent;
