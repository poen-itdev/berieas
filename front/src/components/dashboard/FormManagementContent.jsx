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
  const [contentItems, setContentItems] = useState(['']);

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
      // formDocument가 JSON 형식이면 파싱
      try {
        const parsed = JSON.parse(form.formDocument || '{}');
        setContentItems(parsed.contents || ['']);
      } catch {
        setContentItems(['']);
      }
      setSelectedForm(form);
    } else {
      setFormData({
        formTitle: '',
        formType: '',
        formDocument: '',
      });
      setContentItems(['']);
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

    // 빈 항목 제거
    const filteredItems = contentItems.filter((item) => item.trim() !== '');
    if (filteredItems.length === 0) {
      alert('최소 1개 이상의 항목을 입력해주세요.');
      return;
    }

    try {
      setLoading(true);

      // JSON 형식으로 변환
      const formDocument = JSON.stringify({
        contents: filteredItems,
      });

      const dataToSend = {
        ...formData,
        formDocument: formDocument,
      };

      console.log('양식 등록 데이터:', dataToSend);

      const response = await apiRequest(API_URLS.FORM_ADD, {
        method: 'POST',
        body: JSON.stringify(dataToSend),
      });

      console.log('양식 등록 응답:', response);

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
    <Box sx={{ p: 3, mt: 3 }}>
      <PageHeader title="양식 관리" fontSize="30px" />

      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            양식 목록 ({forms.length})
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleDialogOpen()}
            sx={{
              bgcolor: '#3275FC',
              '&:hover': { bgcolor: '#2563eb' },
            }}
          >
            새 양식 만들기
          </Button>
        </Box>

        {loading ? (
          <Typography sx={{ textAlign: 'center', py: 4, color: '#666' }}>
            로딩 중...
          </Typography>
        ) : forms.length === 0 ? (
          <Typography sx={{ textAlign: 'center', py: 4, color: '#666' }}>
            등록된 양식이 없습니다.
          </Typography>
        ) : (
          <List>
            {forms.map((form, index) => (
              <React.Fragment key={form.formNo}>
                <ListItem
                  sx={{
                    py: 2,
                    '&:hover': { bgcolor: '#f8f9fa' },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      width: '100%',
                      gap: 2,
                    }}
                  >
                    <Typography
                      sx={{
                        minWidth: 40,
                        fontWeight: 600,
                        color: '#666',
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
                          fontSize: '1rem',
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={() => handleViewForm(form.formNo)}
                        sx={{ color: '#1976d2' }}
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteForm(form.formNo)}
                        sx={{ color: '#f44336' }}
                      >
                        <Delete />
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
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {selectedForm ? '양식 수정' : '새 양식 만들기'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              fullWidth
              label="양식 제목"
              placeholder="예: [공통] 기안서"
              value={formData.formTitle}
              onChange={(e) =>
                setFormData({ ...formData, formTitle: e.target.value })
              }
            />
            <TextField
              fullWidth
              label="구분"
              placeholder="예: 공통, 휴가, 출장 등"
              value={formData.formType}
              onChange={(e) =>
                setFormData({ ...formData, formType: e.target.value })
              }
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                양식 항목
              </Typography>
              {contentItems.map((item, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <TextField
                    fullWidth
                    label={`${index + 1}. 항목`}
                    placeholder="예: 부서/직급 : "
                    value={item}
                    onChange={(e) => {
                      const newItems = [...contentItems];
                      newItems[index] = e.target.value;
                      setContentItems(newItems);
                    }}
                  />
                  <IconButton
                    color="error"
                    onClick={() => {
                      if (contentItems.length > 1) {
                        setContentItems(
                          contentItems.filter((_, i) => i !== index)
                        );
                      }
                    }}
                    disabled={contentItems.length === 1}
                  >
                    <Delete />
                  </IconButton>
                </Box>
              ))}
              <Button
                startIcon={<Add />}
                onClick={() => setContentItems([...contentItems, ''])}
                sx={{ mt: 1 }}
              >
                항목 추가
              </Button>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setDialogOpen(false)}>취소</Button>
          <Button
            variant="contained"
            onClick={handleSaveForm}
            disabled={loading}
            sx={{
              bgcolor: '#3275FC',
              '&:hover': { bgcolor: '#2563eb' },
            }}
          >
            {loading ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 양식 상세보기 다이얼로그 */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            양식 상세
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {selectedForm && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>
                  양식 번호
                </Typography>
                <Typography variant="body1">
                  {String(selectedForm.formNo).padStart(2, '0')}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>
                  양식 제목
                </Typography>
                <Typography variant="body1">
                  {selectedForm.formTitle}
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>
                  구분
                </Typography>
                <Typography variant="body1">{selectedForm.formType}</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>
                  양식 항목
                </Typography>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: '#f8f9fa',
                  }}
                >
                  {(() => {
                    try {
                      const parsed = JSON.parse(
                        selectedForm.formDocument || '{}'
                      );
                      const contents = parsed.contents || [];
                      return contents.length > 0 ? (
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 1,
                          }}
                        >
                          {contents.map((item, index) => (
                            <Typography key={index} variant="body2">
                              {index + 1}. {item}
                            </Typography>
                          ))}
                        </Box>
                      ) : (
                        '내용 없음'
                      );
                    } catch {
                      return selectedForm.formDocument || '내용 없음';
                    }
                  })()}
                </Paper>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setViewDialogOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FormManagementContent;
