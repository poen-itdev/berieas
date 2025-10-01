import React, { useEffect } from 'react';
import { Box, Button, Tooltip } from '@mui/material';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import Heading from '@tiptap/extension-heading';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
  Table as TableExtension,
  TableRow as TipTapTableRow,
  TableHeader as TipTapTableHeader,
  TableCell as TipTapTableCell,
} from '@tiptap/extension-table';

const RichEditor = ({ value, onChange, minHeight = 600 }) => {
  // 셀/헤더에 배경색 속성 추가
  const CustomTableCell = TipTapTableCell.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        backgroundColor: {
          default: null,
          parseHTML: (el) => el.style.backgroundColor || null,
          renderHTML: (attrs) => ({
            style: attrs.backgroundColor
              ? `background-color: ${attrs.backgroundColor};`
              : null,
          }),
        },
      };
    },
  });

  const CustomTableHeader = TipTapTableHeader.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        backgroundColor: {
          default: null,
          parseHTML: (el) => el.style.backgroundColor || null,
          renderHTML: (attrs) => ({
            style: attrs.backgroundColor
              ? `background-color: ${attrs.backgroundColor};`
              : null,
          }),
        },
      };
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: '내용을 입력하세요' }),
      Underline,
      Heading.configure({ levels: [1, 2, 3] }),
      Bold,
      Italic,
      Link.configure({ openOnClick: false }),
      Image.configure({ HTMLAttributes: { class: 'ProseMirror-image' } }),
      TableExtension.configure({ resizable: true }),
      TipTapTableRow,
      CustomTableHeader,
      CustomTableCell,
    ],
    content: value,
    onUpdate: ({ editor }) => onChange && onChange(editor.getHTML()),
  });

  // value가 변경될 때 에디터 내용 업데이트
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  const IconButton = ({ title, onClick, children }) => (
    <Tooltip title={title} arrow>
      <Button size="small" onClick={onClick} sx={{ minWidth: 34, px: 0.5 }}>
        {children}
      </Button>
    </Tooltip>
  );

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          px: 1.5,
          py: 1,
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#f8f9fa',
        }}
      >
        <IconButton
          title="굵게"
          onClick={() => editor?.chain().focus().toggleBold().run()}
        >
          B
        </IconButton>
        <IconButton
          title="기울임"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
        >
          <span style={{ fontStyle: 'italic' }}>I</span>
        </IconButton>
        <IconButton
          title="밑줄"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
        >
          <span style={{ textDecoration: 'underline' }}>U</span>
        </IconButton>
        <IconButton
          title="불릿"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
        >
          •
        </IconButton>
        <IconButton
          title="번호"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        >
          1.
        </IconButton>
        <IconButton
          title="실행취소"
          onClick={() => editor?.chain().focus().undo().run()}
        >
          ↶
        </IconButton>
        <IconButton
          title="재실행"
          onClick={() => editor?.chain().focus().redo().run()}
        >
          ↷
        </IconButton>
        <IconButton
          title="표 삽입"
          onClick={() =>
            editor
              ?.chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          표
        </IconButton>
        <IconButton
          title="열 추가(우)"
          onClick={() => editor?.chain().focus().addColumnAfter().run()}
        >
          열+
        </IconButton>
        <IconButton
          title="행 추가(아래)"
          onClick={() => editor?.chain().focus().addRowAfter().run()}
        >
          행+
        </IconButton>
        <IconButton
          title="셀 병합"
          onClick={() => editor?.chain().focus().mergeCells().run()}
        >
          합치기
        </IconButton>
        <IconButton
          title="셀 분할"
          onClick={() => editor?.chain().focus().splitCell().run()}
        >
          나누기
        </IconButton>
      </Box>
      <Box
        sx={{
          p: 2,
          height: '100%',
          overflow: 'auto',
          '& .ProseMirror': {
            minHeight,
            border: '1px solid #e0e0e0',
            borderRadius: 1,
            p: 2,
            outline: 'none',
            textAlign: 'left',
            backgroundColor: '#fff',
            '& table': { width: '100%', borderCollapse: 'collapse' },
            '& th, & td': { border: '1px solid #ccc', p: 1 },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Box>
  );
};

export default RichEditor;
