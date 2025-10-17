import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Add, Delete, Visibility } from '@mui/icons-material';
import { API_URLS } from '../../config/api';
import { apiRequest } from '../../utils/apiHelper';
import PageHeader from '../common/PageHeader';

const FormManagementContent = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [formData, setFormData] = useState({
    formTitle: '',
    formType: '',
    formDocument: '',
  });
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

  useEffect(() => {
    fetchForms();
  }, []);

  // 양식 등록/수정 다이얼로그 열기
  const handleDialogOpen = (form = null) => {
    if (form) {
      setFormData({
        formTitle: form.formTitle,
        formType: form.formType,
        formDocument: form.formDocument || '',
      });
      setSelectedForm(form);
    } else {
      setFormData({
        formTitle: '',
        formType: '',
        formDocument: '',
      });
      setSelectedForm(null);
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
      alert('양식을 불러올 수 없습니다.');
    }
  };

  // 양식 저장
  const handleSaveForm = async () => {
    if (!formData.formTitle || !formData.formType) {
      alert('양식 제목과 구분을 입력해주세요.');
      return;
    }

    if (!formData.formDocument.trim()) {
      alert('양식 내용을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);

      const response = await apiRequest(API_URLS.FORM_ADD, {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert('양식이 등록되었습니다.');
        setDialogOpen(false);
        fetchForms();
      } else {
        alert(`양식 등록에 실패했습니다.\n${response.data || ''}`);
      }
    } catch (error) {
      console.error('양식 등록 실패:', error);
      alert('양식 등록에 실패했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // 양식 삭제
  const handleDeleteForm = async (formNo) => {
    if (!confirm('정말 이 양식을 삭제하시겠습니까?')) return;

    try {
      setLoading(true);
      const response = await apiRequest(`${API_URLS.FORM_DELETE}/${formNo}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('양식이 삭제되었습니다.');
        fetchForms();
      } else {
        alert('양식 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('양식 삭제 실패:', error);
      alert('양식 삭제에 실패했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, mt: { xs: 1.5, sm: 3 } }}>
      <Container maxWidth="xl" sx={{ mx: 0, px: 0 }}>
        <PageHeader title="양식 관리" fontSize={{ xs: '20px', sm: '30px' }} />

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
              양식 목록 ({forms.length})
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
              새 양식 만들기
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
              로딩 중...
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
              등록된 양식이 없습니다.
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
                          secondary={`구분: ${form.formType}`}
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
              {selectedForm ? '양식 수정' : '새 양식 만들기'}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#666',
                fontSize: { xs: '12px', sm: '14px' },
              }}
            >
              기안서에 사용할 양식을 등록하세요.
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
                label="양식 제목"
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
                label="구분"
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

              <TextField
                fullWidth
                label="양식 내용"
                placeholder="양식 내용을 자유롭게 작성해주세요"
                multiline
                rows={{ xs: 6, sm: 10 }}
                value={formData.formDocument}
                sx={{
                  '& .MuiInputBase-input': {
                    fontSize: { xs: '12px', sm: '14px' },
                  },
                  '& .MuiInputLabel-root': {
                    fontSize: { xs: '13px', sm: '14px' },
                  },
                }}
                onChange={(e) =>
                  setFormData({ ...formData, formDocument: e.target.value })
                }
              />
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
              {loading ? '저장 중...' : '저장'}
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
              취소
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
              양식 상세
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#666',
                mt: 1,
                fontSize: { xs: '12px', sm: '14px' },
              }}
            >
              등록된 양식 정보를 확인할 수 있습니다.
            </Typography>
          </Box>
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
                    양식 번호
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
                    양식 제목
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
                    구분
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
                    양식 내용
                  </Typography>
                  <Paper
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      bgcolor: '#f8f9fa',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        fontSize: { xs: '12px', sm: '0.875rem' },
                      }}
                    >
                      {selectedForm.formDocument || '내용 없음'}
                    </Typography>
                  </Paper>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              p: { xs: 2, sm: 3 },
              backgroundColor: '#f8f9fa',
              borderTop: '1px solid #e0e0e0',
              justifyContent: 'center',
            }}
          >
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
              닫기
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default FormManagementContent;
