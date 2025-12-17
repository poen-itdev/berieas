import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  Container,
  Autocomplete,
  Chip,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { Add, Delete, Visibility, Print, Edit } from '@mui/icons-material';
import { API_URLS } from '../../config/api';
import { apiRequest } from '../../utils/apiHelper';
import PageHeader from '../common/PageHeader';
import PermissionGuard from '../common/PermissionGuard';
import { useLanguage } from '../../contexts/LanguageContext';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  Bold,
  Essentials,
  Italic,
  Paragraph,
  Undo,
  Heading,
  Underline,
  Strikethrough,
  List as CKList,
  Link,
  Alignment,
  FontColor,
  FontBackgroundColor,
  Table,
  TableToolbar,
  TableProperties,
  TableCellProperties,
  TableColumnResize,
} from 'ckeditor5';
import 'ckeditor5/ckeditor5.css';

const FormManagementContent = () => {
  const { t } = useLanguage();
  const editorRef = useRef(null);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [members, setMembers] = useState([]);
  const [selectedApprovers, setSelectedApprovers] = useState([]);
  const [formData, setFormData] = useState({
    formTitle: '',
    formType: '',
    formDocument: '',
    signId1: '',
    signId2: '',
    signId3: '',
    signId4: '',
    signId5: '',
    signModifyYn: false,
  });

  // CKEditor 설정
  const editorConfig = {
    licenseKey: 'GPL', // GPL 라이선스 (오픈소스 무료 사용)
    toolbar: {
      items: [
        'undo',
        'redo',
        '|',
        'heading',
        '|',
        'bold',
        'italic',
        'underline',
        'strikethrough',
        '|',
        'bulletedList',
        'numberedList',
        '|',
        'fontColor',
        'fontBackgroundColor',
        '|',
        'alignment',
        '|',
        'link',
        '|',
        'insertTable',
        'tableColumn',
        'tableRow',
        'mergeTableCells',
        'tableProperties',
        'tableCellProperties',
      ],
    },
    plugins: [
      Bold,
      Essentials,
      Italic,
      Paragraph,
      Undo,
      Heading,
      Underline,
      Strikethrough,
      CKList,
      Link,
      Alignment,
      FontColor,
      FontBackgroundColor,
      Table,
      TableToolbar,
      TableProperties,
      TableCellProperties,
      TableColumnResize,
    ],
    table: {
      contentToolbar: [
        'tableColumn',
        'tableRow',
        'mergeTableCells',
        'tableProperties',
        'tableCellProperties',
      ],
    },
    heading: {
      options: [
        { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
        {
          model: 'heading1',
          view: 'h1',
          title: 'Heading 1',
          class: 'ck-heading_heading1',
        },
        {
          model: 'heading2',
          view: 'h2',
          title: 'Heading 2',
          class: 'ck-heading_heading2',
        },
        {
          model: 'heading3',
          view: 'h3',
          title: 'Heading 3',
          class: 'ck-heading_heading3',
        },
      ],
    },
    placeholder: t('enterFormContent'),
  };

  // 양식 목록 불러오기
  const fetchForms = async () => {
    try {
      setLoading(true);
      const response = await apiRequest(API_URLS.APPROVAL_FORMS, {
        method: 'GET',
      });
      if (response.ok) {
        setForms(response.data);
      } else {
        console.error('양식 목록 가져오기 실패:', response.status);
      }
    } catch (error) {
      console.error('양식 목록 가져오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 회원 목록 불러오기
  const fetchMembers = async () => {
    try {
      const response = await apiRequest(API_URLS.MEMBER_ACTIVE_MEMBERS, {
        method: 'GET',
      });
      if (response.ok) {
        setMembers(response.data);
      }
    } catch (error) {
      console.error('회원 목록 가져오기 실패:', error);
    }
  };

  useEffect(() => {
    fetchForms();
    fetchMembers();
  }, []);

  // 인쇄 기능
  const handlePrint = () => {
    window.print();
  };

  // 양식 등록/수정 다이얼로그 열기
  const handleDialogOpen = (form = null) => {
    if (form) {
      setFormData({
        formTitle: form.formTitle,
        formType: form.formType,
        formDocument: form.formDocument || '',
        signId1: '',
        signId2: '',
        signId3: '',
        signId4: '',
        signId5: '',
        signModifyYn: false,
      });
      setSelectedForm(form);
      setSelectedApprovers([]);
    } else {
      setFormData({
        formTitle: '',
        formType: '',
        formDocument: '',
        signId1: '',
        signId2: '',
        signId3: '',
        signId4: '',
        signId5: '',
        signModifyYn: false,
      });
      setSelectedForm(null);
      setSelectedApprovers([]);
    }
    setDialogOpen(true);
  };

  // 양식 상세보기
  const handleViewForm = async (formNo) => {
    try {
      const response = await apiRequest(
        `${API_URLS.APPROVAL_FORM_DETAIL}/${formNo}`,
        {
          method: 'GET',
        }
      );
      if (response.ok) {
        setSelectedForm(response.data);
        setViewDialogOpen(true);
      }
    } catch (error) {
      console.error('양식 조회 실패:', error);
      alert(t('formLoadFailed'));
    }
  };

  // 양식 수정
  const handleEditForm = async (formNo) => {
    try {
      const response = await apiRequest(
        `${API_URLS.APPROVAL_FORM_DETAIL}/${formNo}`,
        {
          method: 'GET',
        }
      );
      if (response.ok) {
        const formData = response.data;
        
        // 결재자 정보 로드
        const approvers = formData.approvers || [];
        setSelectedApprovers(approvers);
        
        // 폼 데이터 설정
        setFormData({
          formTitle: formData.formTitle,
          formType: formData.formType,
          formDocument: formData.formDocument || '',
          signId1: approvers[0]?.memberName || '',
          signId2: approvers[1]?.memberName || '',
          signId3: approvers[2]?.memberName || '',
          signId4: approvers[3]?.memberName || '',
          signId5: approvers[4]?.memberName || '',
          signModifyYn: formData.signModifyYn || false,
        });
        
        // 수정 모드로 폼 설정
        setSelectedForm({ ...formData, formNo: formNo });
        setDialogOpen(true);
      }
    } catch (error) {
      console.error('양식 조회 실패:', error);
      alert(t('formLoadFailed'));
    }
  };

  // 양식 저장 (신규 등록 또는 수정)
  const handleSaveForm = async () => {
    if (!formData.formTitle || !formData.formType) {
      alert(t('formTitleRequired'));
      return;
    }

    if (!formData.formDocument.trim()) {
      alert(t('formContentRequired'));
      return;
    }

    try {
      setLoading(true);

      // 수정 모드인지 신규 등록 모드인지 확인
      const isEditMode = selectedForm && selectedForm.formNo;
      const apiUrl = isEditMode 
        ? `${API_URLS.FORM_UPDATE}/${selectedForm.formNo}`
        : API_URLS.FORM_ADD;
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await apiRequest(apiUrl, {
        method: method,
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert(isEditMode ? t('formUpdated') : t('formRegistered'));
        setDialogOpen(false);
        fetchForms();
      } else {
        alert(`${isEditMode ? t('formUpdateFailed') : t('formRegisterFailed')}\n${response.data || ''}`);
      }
    } catch (error) {
      console.error('양식 저장 실패:', error);
      alert(`${t('formRegisterFailed')}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 양식 삭제
  const handleDeleteForm = async (formNo) => {
    if (!confirm(t('confirmDeleteForm'))) return;

    try {
      setLoading(true);
      const response = await apiRequest(`${API_URLS.FORM_DELETE}/${formNo}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert(t('formDeleted'));
        fetchForms();
      } else {
        alert(t('formDeleteFailed'));
      }
    } catch (error) {
      console.error('양식 삭제 실패:', error);
      alert(`${t('formDeleteFailed')}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, mt: { xs: 1.5, sm: 3 } }}>
      <Container maxWidth="xl" sx={{ mx: 0, px: 0 }}>
        <PageHeader
          title={t('formManagementTitle')}
          fontSize={{ xs: '20px', sm: '30px' }}
        />

        <Paper sx={{ p: { xs: 1.5, sm: 3 }, borderRadius: 2 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              mb: { xs: 2, sm: 3 },
              alignItems: 'center',
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              gap: { xs: 1, sm: 0 },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: { xs: '14px', sm: '1.25rem' },
              }}
            >
              {t('formList')} ({forms.length})
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add sx={{ fontSize: { xs: '16px', sm: '20px' } }} />}
              onClick={() => handleDialogOpen()}
              sx={{
                bgcolor: '#3275FC',
                '&:hover': { bgcolor: '#2563eb' },
                fontSize: { xs: '12px', sm: '14px' },
                padding: { xs: '6px 12px', sm: '6px 16px' },
                minWidth: { xs: 'auto', sm: '64px' },
              }}
            >
              {t('createNewForm')}
            </Button>
          </Box>

          {loading ? (
            <Typography
              sx={{
                textAlign: 'center',
                py: { xs: 2, sm: 4 },
                color: '#666',
                fontSize: { xs: '12px', sm: '14px' },
              }}
            >
              {t('loading')}
            </Typography>
          ) : forms.length === 0 ? (
            <Typography
              sx={{
                textAlign: 'center',
                py: { xs: 2, sm: 4 },
                color: '#666',
                fontSize: { xs: '12px', sm: '14px' },
              }}
            >
              {t('noFormsRegistered')}
            </Typography>
          ) : (
            <List>
              {forms.map((form, index) => (
                <React.Fragment key={form.formNo}>
                  <ListItem
                    sx={{
                      py: { xs: 1, sm: 2 },
                      px: { xs: 1, sm: 2 },
                      '&:hover': { bgcolor: '#f8f9fa' },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        width: '100%',
                        gap: { xs: 1, sm: 2 },
                      }}
                    >
                      <Typography
                        sx={{
                          minWidth: { xs: 25, sm: 40 },
                          fontWeight: 600,
                          color: '#666',
                          fontSize: { xs: '12px', sm: '14px' },
                        }}
                      >
                        {String(form.formNo).padStart(2, '0')}
                      </Typography>
                      <Box sx={{ flex: 1 }}>
                        <ListItemText
                          primary={form.formTitle}
                          secondary={`${t('category')}: ${form.formType}`}
                          primaryTypographyProps={{
                            fontWeight: 600,
                            fontSize: { xs: '13px', sm: '1rem' },
                          }}
                          secondaryTypographyProps={{
                            fontSize: { xs: '11px', sm: '0.875rem' },
                          }}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', gap: { xs: 0.5, sm: 1 } }}>
                        <IconButton
                          size="small"
                          onClick={() => handleViewForm(form.formNo)}
                          sx={{
                            color: '#1976d2',
                            padding: { xs: '4px', sm: '8px' },
                          }}
                        >
                          <Visibility
                            sx={{ fontSize: { xs: '18px', sm: '20px' } }}
                          />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleEditForm(form.formNo)}
                          sx={{
                            color: '#ff9800',
                            padding: { xs: '4px', sm: '8px' },
                          }}
                        >
                          <Edit
                            sx={{ fontSize: { xs: '18px', sm: '20px' } }}
                          />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteForm(form.formNo)}
                          sx={{
                            color: '#f44336',
                            padding: { xs: '4px', sm: '8px' },
                          }}
                        >
                          <Delete
                            sx={{ fontSize: { xs: '18px', sm: '20px' } }}
                          />
                        </IconButton>
                      </Box>
                    </Box>
                  </ListItem>
                  {index < forms.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>

        {/* 양식 등록/수정 다이얼로그 */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: 2,
              m: { xs: 1, sm: 2 },
              width: { xs: 'calc(100% - 16px)', sm: '100%' },
            },
          }}
        >
          <Box
            sx={{
              backgroundColor: '#f8f9fa',
              borderBottom: '1px solid #e0e0e0',
              mb: { xs: 2, sm: 3 },
              p: { xs: 2, sm: 3 },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: { xs: '16px', sm: '1.25rem' },
              }}
            >
              {selectedForm ? t('editForm') : t('createNewForm')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#666',
                fontSize: { xs: '12px', sm: '14px' },
              }}
            >
              {t('registerFormForDraft')}
            </Typography>
          </Box>
          <DialogContent sx={{ p: { xs: 2, sm: 3 }, pt: { xs: 1, sm: 1 } }}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: { xs: 1.5, sm: 2 },
              }}
            >
              <TextField
                fullWidth
                label={t('formTitle')}
                placeholder="예: [공통] 기안서"
                value={formData.formTitle}
                sx={{
                  mt: 1,
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '13px', sm: '14px' },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '13px', sm: '14px' },
                  },
                }}
                onChange={(e) =>
                  setFormData({ ...formData, formTitle: e.target.value })
                }
              />
              <TextField
                fullWidth
                label={t('category')}
                placeholder="예: 기안서, 휴가, 출장 등"
                value={formData.formType}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '13px', sm: '14px' },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '13px', sm: '14px' },
                  },
                }}
                onChange={(e) =>
                  setFormData({ ...formData, formType: e.target.value })
                }
              />

              {/* 양식 내용 에디터 (CKEditor5 - 표 기능 포함) */}
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    color: 'rgba(0, 0, 0, 0.6)',
                    fontSize: { xs: '13px', sm: '14px' },
                  }}
                >
                  {t('formContent')}
                </Typography>
                <Box
                  sx={{
                    '& .ck-editor': {
                      '& .ck-toolbar': {
                        backgroundColor: '#f8f9fa',
                        borderRadius: '4px 4px 0 0',
                      },
                      '& .ck-content': {
                        minHeight: '350px',
                        fontSize: '14px',
                        padding: '15px',
                      },
                    },
                    '& .ck-content table': {
                      borderCollapse: 'collapse',
                      width: '100%',
                      margin: '10px 0',
                    },
                    '& .ck-content table td, & .ck-content table th': {
                      border: '1px solid #555',
                      padding: '10px',
                      minWidth: '50px',
                    },
                    '& .ck-content table th': {
                      backgroundColor: '#f5f5f5',
                      fontWeight: 600,
                      textAlign: 'center',
                    },
                  }}
                >
                  <CKEditor
                    editor={ClassicEditor}
                    config={editorConfig}
                    data={formData.formDocument}
                    onChange={(event, editor) => {
                      const data = editor.getData();
                      setFormData({ ...formData, formDocument: data });
                    }}
                    onReady={(editor) => {
                      editorRef.current = editor;
                    }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 1,
                    color: '#666',
                    fontSize: { xs: '11px', sm: '12px' },
                  }}
                >
                  💡 {t('tableEditHelp') || '툴바의 "표 삽입" 버튼을 클릭하거나, 표 안에서 우클릭하여 행/열 추가, 셀 병합 등을 할 수 있습니다.'}
                </Typography>
              </Box>

              {/* 결재자 선택 (선택사항) */}
              <Box sx={{ mt: 2 }}>
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 1,
                    color: '#666',
                    fontSize: { xs: '12px', sm: '14px' },
                  }}
                >
                  {t('predefineApprovers')} ({t('optional')})
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mb: 1,
                    color: '#999',
                    fontSize: { xs: '11px', sm: '12px' },
                  }}
                >
                  {t('predefineApproversHelp')}
                </Typography>
                <Autocomplete
                  multiple
                  options={members}
                  getOptionLabel={(option) =>
                    `${option.memberName} (${option.memberDepartment})`
                  }
                  value={selectedApprovers}
                  onChange={(event, newValue) => {
                    if (newValue.length > 5) {
                      alert(t('maxApproversExceeded'));
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
                      placeholder={t('selectApprovers')}
                      variant="outlined"
                      sx={{
                        '& .MuiInputBase-input': {
                          fontSize: { xs: '12px', sm: '14px' },
                        },
                      }}
                    />
                  )}
                />
                
                {/* 결재자 수정 허용 체크박스 */}
                {selectedApprovers.length > 0 && (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.signModifyYn}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            signModifyYn: e.target.checked,
                          })
                        }
                        size="small"
                      />
                    }
                    label={
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{ fontSize: { xs: '12px', sm: '14px' } }}
                        >
                          {t('allowApproverModification')}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: '#999',
                            fontSize: { xs: '10px', sm: '11px' },
                          }}
                        >
                          {t('allowApproverModificationHelp')}
                        </Typography>
                      </Box>
                    }
                    sx={{ mt: 1, ml: 0 }}
                  />
                )}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions
            sx={{
              p: { xs: 2, sm: 3 },
              backgroundColor: '#f8f9fa',
              borderTop: '1px solid #e0e0e0',
              justifyContent: 'center',
              gap: { xs: 1, sm: 2 },
            }}
          >
            <Button
              variant="contained"
              onClick={handleSaveForm}
              disabled={loading}
              sx={{
                minWidth: { xs: '80px', sm: '109px' },
                height: { xs: '32px', sm: '40px' },
                fontWeight: 600,
                fontSize: { xs: '12px', sm: '14px' },
                backgroundColor: '#1976d2',
                '&:hover': { backgroundColor: '#1565c0' },
              }}
            >
              {loading ? t('saving') : t('save')}
            </Button>
            <Button
              onClick={() => setDialogOpen(false)}
              variant="outlined"
              sx={{
                minWidth: { xs: '80px', sm: '109px' },
                height: { xs: '32px', sm: '40px' },
                fontWeight: 600,
                fontSize: { xs: '12px', sm: '14px' },
                borderColor: '#1976d2',
                color: '#1976d2',
                '&:hover': {
                  borderColor: '#1565c0',
                  backgroundColor: '#f3f8ff',
                },
              }}
            >
              {t('cancel')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* 양식 상세보기 다이얼로그 */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
          sx={{
            '& .MuiDialog-paper': {
              borderRadius: 2,
              m: { xs: 1, sm: 2 },
              width: { xs: 'calc(100% - 16px)', sm: '100%' },
            },
            '@media print': {
              '& .MuiDialog-container': {
                display: 'block !important',
              },
              '& .MuiDialog-paper': {
                boxShadow: 'none !important',
                margin: '0 !important',
                maxWidth: '100% !important',
                width: '100% !important',
              },
            },
          }}
        >
          <Box
            sx={{
              backgroundColor: '#f8f9fa',
              borderBottom: '1px solid #e0e0e0',
              mb: { xs: 2, sm: 3 },
              p: { xs: 2, sm: 3 },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: { xs: '16px', sm: '1.25rem' },
              }}
            >
              {t('formDetail')}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#666',
                mt: 1,
                fontSize: { xs: '12px', sm: '14px' },
              }}
            >
              {t('viewFormInfo')}
            </Typography>
          </Box>
          <style>
            {`
              @media print {
                body * {
                  visibility: hidden;
                }
                .MuiDialog-root,
                .MuiDialog-root * {
                  visibility: visible;
                }
                .MuiDialog-root {
                  position: absolute;
                  left: 0;
                  top: 0;
                }
                .MuiBackdrop-root {
                  display: none !important;
                }
              }
            `}
          </style>
          <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
            {selectedForm && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: { xs: 2, sm: 3 },
                }}
              >
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: '#666',
                      mb: 1,
                      fontSize: { xs: '12px', sm: '0.875rem' },
                    }}
                  >
                    {t('formNumber')}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: { xs: '13px', sm: '1rem' } }}
                  >
                    {String(selectedForm.formNo).padStart(2, '0')}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: '#666',
                      mb: 1,
                      fontSize: { xs: '12px', sm: '0.875rem' },
                    }}
                  >
                    {t('formTitle')}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: { xs: '13px', sm: '1rem' } }}
                  >
                    {selectedForm.formTitle}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: '#666',
                      mb: 1,
                      fontSize: { xs: '12px', sm: '0.875rem' },
                    }}
                  >
                    {t('category')}
                  </Typography>
                  <Typography
                    variant="body1"
                    sx={{ fontSize: { xs: '13px', sm: '1rem' } }}
                  >
                    {selectedForm.formType}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: '#666',
                      mb: 1,
                      fontSize: { xs: '12px', sm: '0.875rem' },
                    }}
                  >
                    {t('formContent')}
                  </Typography>
                  <Paper
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      bgcolor: '#f8f9fa',
                      '& table': {
                        borderCollapse: 'collapse',
                        width: '100%',
                        margin: '10px 0',
                      },
                      '& table td, & table th': {
                        border: '1px solid #555',
                        padding: '10px',
                        minWidth: '50px',
                      },
                      '& table th': {
                        backgroundColor: '#f5f5f5',
                        fontWeight: 600,
                        textAlign: 'center',
                      },
                    }}
                  >
                    {selectedForm.formDocument ? (
                      <Box
                        dangerouslySetInnerHTML={{
                          __html: selectedForm.formDocument,
                        }}
                        sx={{
                          fontSize: { xs: '12px', sm: '0.875rem' },
                          '& p': {
                            margin: '8px 0',
                          },
                          '& h1, & h2, & h3': {
                            marginTop: '16px',
                            marginBottom: '8px',
                          },
                        }}
                      />
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{
                          color: '#999',
                          fontSize: { xs: '12px', sm: '0.875rem' },
                        }}
                      >
                        {t('noContent')}
                      </Typography>
                    )}
                  </Paper>
                </Box>

                {/* 결재자 정보 */}
                {selectedForm.approvers && selectedForm.approvers.length > 0 && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: '#666',
                        mb: 1,
                        fontSize: { xs: '12px', sm: '0.875rem' },
                      }}
                    >
                      {t('predefineApprovers')}
                    </Typography>
                    <Paper
                      sx={{
                        p: { xs: 1.5, sm: 2 },
                        bgcolor: '#f8f9fa',
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {selectedForm.approvers.map((approver, index) => (
                          <Box
                            key={approver.memberId}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Chip
                              label={`${index + 1}차`}
                              size="small"
                              sx={{
                                minWidth: '45px',
                                bgcolor: '#1976d2',
                                color: 'white',
                                fontWeight: 600,
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{ fontSize: { xs: '12px', sm: '0.875rem' } }}
                            >
                              {approver.memberName} ({approver.memberDepartment} /{' '}
                              {approver.memberPosition})
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Paper>
                  </Box>
                )}

                {/* 결재자 수정 허용 여부 */}
                {selectedForm.approvers && selectedForm.approvers.length > 0 && (
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: '#666',
                        mb: 1,
                        fontSize: { xs: '12px', sm: '0.875rem' },
                      }}
                    >
                      {t('allowApproverModification')}
                    </Typography>
                    <Chip
                      label={selectedForm.signModifyYn ? t('yes') : t('no')}
                      size="small"
                      color={selectedForm.signModifyYn ? 'success' : 'default'}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              p: { xs: 2, sm: 3 },
              backgroundColor: '#f8f9fa',
              borderTop: '1px solid #e0e0e0',
              justifyContent: 'center',
              gap: { xs: 1, sm: 2 },
            }}
          >
            <Button
              variant="contained"
              startIcon={<Print />}
              onClick={handlePrint}
              sx={{
                minWidth: { xs: '80px', sm: '109px' },
                height: { xs: '32px', sm: '40px' },
                fontWeight: 600,
                fontSize: { xs: '12px', sm: '14px' },
                backgroundColor: '#43a047',
                '&:hover': { backgroundColor: '#388e3c' },
              }}
            >
              {t('print')}
            </Button>
            <Button
              onClick={() => setViewDialogOpen(false)}
              variant="outlined"
              sx={{
                minWidth: { xs: '80px', sm: '109px' },
                height: { xs: '32px', sm: '40px' },
                fontWeight: 600,
                fontSize: { xs: '12px', sm: '14px' },
                borderColor: '#1976d2',
                color: '#1976d2',
                '&:hover': {
                  borderColor: '#1565c0',
                  backgroundColor: '#f3f8ff',
                },
              }}
            >
              {t('close')}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

// 관리자 권한이 필요한 컴포넌트
const AdminOnlyContent = () => {
  const { t } = useLanguage();
  return (
    <Box sx={{ p: 3, mt: 3 }}>
      <Container maxWidth="xl" sx={{ mx: 0, px: 0 }}>
        <PageHeader title={t('formManagementTitle')} fontSize="30px" />
        <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
          <Typography variant="h5" sx={{ color: '#666', fontWeight: 500 }}>
            {t('adminPageOnly')}
          </Typography>
          <Typography variant="body1" sx={{ color: '#999', mt: 1 }}>
            {t('adminPermissionRequired')}
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

const FormManagementWithPermission = () => (
  <PermissionGuard requiredPermission="ADMIN" fallback={<AdminOnlyContent />}>
    <FormManagementContent />
  </PermissionGuard>
);

export default FormManagementWithPermission;
