import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Table,
  Image,
  FileText,
  Type,
  Heading,
  Link
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { EditorContent } from '@/types/document-builder';

interface RichTextEditorProps {
  content: EditorContent[];
  onChange: (content: EditorContent[]) => void;
  onInsertDynamicField: () => void;
  onInsertLegalClause: () => void;
  className?: string;
}

export const RichTextEditor = ({ 
  content, 
  onChange, 
  onInsertDynamicField,
  onInsertLegalClause,
  className 
}: RichTextEditorProps) => {
  const [selectedContent, setSelectedContent] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Format text selection
  const formatText = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  // Handle content changes
  const handleContentChange = useCallback(() => {
    if (!editorRef.current) return;
    
    const htmlContent = editorRef.current.innerHTML;
    const newContent: EditorContent = {
      id: Date.now().toString(),
      type: 'text',
      content: htmlContent,
      order: content.length
    };
    
    // For now, we'll replace the content. In a full implementation,
    // you'd want to maintain the structure better
    onChange([newContent]);
  }, [content.length, onChange]);

  // Insert heading
  const insertHeading = useCallback((level: number) => {
    const heading: EditorContent = {
      id: Date.now().toString(),
      type: 'heading',
      content: {
        text: 'New Heading',
        level: level
      },
      order: content.length
    };
    onChange([...content, heading]);
  }, [content, onChange]);

  // Insert list
  const insertList = useCallback((ordered: boolean = false) => {
    const list: EditorContent = {
      id: Date.now().toString(),
      type: 'list',
      content: {
        items: ['List item 1'],
        ordered: ordered
      },
      order: content.length
    };
    onChange([...content, list]);
  }, [content, onChange]);

  // Insert table
  const insertTable = useCallback(() => {
    const table: EditorContent = {
      id: Date.now().toString(),
      type: 'table',
      content: {
        headers: ['Column 1', 'Column 2'],
        rows: [
          ['Cell 1', 'Cell 2'],
          ['Cell 3', 'Cell 4']
        ]
      },
      order: content.length
    };
    onChange([...content, table]);
  }, [content, onChange]);

  // Insert page break
  const insertPageBreak = useCallback(() => {
    const pageBreak: EditorContent = {
      id: Date.now().toString(),
      type: 'page_break',
      content: {},
      order: content.length
    };
    onChange([...content, pageBreak]);
  }, [content, onChange]);

  // Insert dynamic field
  const handleInsertDynamicField = useCallback(() => {
    const field: EditorContent = {
      id: Date.now().toString(),
      type: 'dynamic_field',
      content: {
        field_name: 'company_name',
        placeholder: '[Company Name]'
      },
      order: content.length
    };
    onChange([...content, field]);
    onInsertDynamicField();
  }, [content, onChange, onInsertDynamicField]);

  // Insert legal clause
  const handleInsertLegalClause = useCallback(() => {
    const clause: EditorContent = {
      id: Date.now().toString(),
      type: 'legal_clause',
      content: {
        clause_id: '',
        title: 'Legal Clause',
        content: 'Select a legal clause to insert...'
      },
      order: content.length
    };
    onChange([...content, clause]);
    onInsertLegalClause();
  }, [content, onChange, onInsertLegalClause]);

  return (
    <div className={cn("border rounded-lg", className)}>
      {/* Toolbar */}
      <div className="border-b p-3 flex flex-wrap items-center gap-2">
        {/* Text formatting */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('bold')}
            className="h-8 w-8 p-0"
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('italic')}
            className="h-8 w-8 p-0"
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('underline')}
            className="h-8 w-8 p-0"
            title="Underline"
          >
            <Underline className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Alignment */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('justifyLeft')}
            className="h-8 w-8 p-0"
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('justifyCenter')}
            className="h-8 w-8 p-0"
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('justifyRight')}
            className="h-8 w-8 p-0"
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => formatText('justifyFull')}
            className="h-8 w-8 p-0"
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Headings */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertHeading(1)}
            className="h-8 px-2"
            title="Heading 1"
          >
            H1
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertHeading(2)}
            className="h-8 px-2"
            title="Heading 2"
          >
            H2
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertHeading(3)}
            className="h-8 px-2"
            title="Heading 3"
          >
            H3
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Lists */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertList(false)}
            className="h-8 w-8 p-0"
            title="Bullet List"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => insertList(true)}
            className="h-8 w-8 p-0"
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Insert elements */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={insertTable}
            className="h-8 w-8 p-0"
            title="Insert Table"
          >
            <Table className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleInsertDynamicField}
            className="h-8 px-2"
            title="Insert Dynamic Field"
          >
            <Type className="h-4 w-4 mr-1" />
            Field
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleInsertLegalClause}
            className="h-8 px-2"
            title="Insert Legal Clause"
          >
            <FileText className="h-4 w-4 mr-1" />
            Clause
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={insertPageBreak}
            className="h-8 px-2"
            title="Insert Page Break"
          >
            Page Break
          </Button>
        </div>
      </div>

      {/* Editor area */}
      <div className="p-4">
        <div
          ref={editorRef}
          contentEditable
          className="min-h-[300px] focus:outline-none prose max-w-none"
          onInput={handleContentChange}
          dangerouslySetInnerHTML={{
            __html: content.find(c => c.type === 'text')?.content || '<p>Start writing your document...</p>'
          }}
        />
        
        {/* Render other content types */}
        {content.filter(c => c.type !== 'text').map((item) => (
          <div key={item.id} className="my-4 p-3 border rounded bg-muted/50">
            {item.type === 'heading' && (
              <div className="font-bold text-lg">
                {React.createElement(
                  `h${item.content.level}`,
                  { className: 'text-lg font-bold' },
                  item.content.text
                )}
              </div>
            )}
            
            {item.type === 'list' && (
              <div>
                {item.content.ordered ? (
                  <ol className="list-decimal list-inside">
                    {item.content.items.map((listItem: string, index: number) => (
                      <li key={index}>{listItem}</li>
                    ))}
                  </ol>
                ) : (
                  <ul className="list-disc list-inside">
                    {item.content.items.map((listItem: string, index: number) => (
                      <li key={index}>{listItem}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            
            {item.type === 'table' && (
              <table className="w-full border-collapse border border-border">
                <thead>
                  <tr>
                    {item.content.headers.map((header: string, index: number) => (
                      <th key={index} className="border border-border p-2 bg-muted font-semibold">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {item.content.rows.map((row: string[], rowIndex: number) => (
                    <tr key={rowIndex}>
                      {row.map((cell: string, cellIndex: number) => (
                        <td key={cellIndex} className="border border-border p-2">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            
            {item.type === 'dynamic_field' && (
              <div className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-sm border-2 border-dashed border-primary">
                {item.content.placeholder}
              </div>
            )}
            
            {item.type === 'legal_clause' && (
              <div className="bg-secondary/50 p-3 rounded border-l-4 border-secondary">
                <div className="font-semibold text-sm text-muted-foreground mb-1">
                  Legal Clause: {item.content.title}
                </div>
                <div className="text-sm">{item.content.content}</div>
              </div>
            )}
            
            {item.type === 'page_break' && (
              <div className="border-t-2 border-dashed border-muted-foreground my-8 relative">
                <div className="absolute left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2 bg-background px-2 text-xs text-muted-foreground">
                  Page Break
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};