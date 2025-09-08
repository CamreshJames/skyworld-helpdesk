import './tiptap-editor.css';
import { BoldIcon, ItalicIcon, UnderlineIcon, OverlineIcon, StrikethroughIcon, Heading1Icon, Heading2Icon, Heading3Icon, Heading4Icon, UnorderedListIcon, OrderedListIcon, LinkIcon, ImageIcon, VideoIcon, BlockquoteIcon, CodeBlockIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon, SuperscriptIcon, SubscriptIcon } from '../../../utils/editor-icons';
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextAlign } from "@tiptap/extension-text-align";
import { Image } from "@tiptap/extension-image";
import Video from "../../../utils/extensions/video-extension";
import { Superscript } from "@tiptap/extension-superscript";
import { Subscript } from "@tiptap/extension-subscript";

const customCommand = (editor: any, command: string, args?: any) => {
    if (editor && editor.can().chain().focus()[command]) {
        editor.chain().focus()[command](args).run();
    }
};

function TiptapEditor({
    content,
    onChange
}: {
    content: string;
    onChange: (content: string) => void;
}) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
            Image,
            Video,
            Superscript,
            Subscript
        ],
        content: content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
    });

    return (
        <div className="tiptap-editor">
            <div className="editor-toolbar">
                <div>
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleBold().run()}
                        className={editor?.isActive('bold') ? 'active' : ''}
                        title="Bold"
                    >
                        <BoldIcon />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleItalic().run()}
                        className={editor?.isActive('italic') ? 'active' : ''}
                        title="Italic"
                    >
                        <ItalicIcon />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleUnderline().run()}
                        className={editor?.isActive('underline') ? 'active' : ''}
                        title="Underline"
                    >
                        <UnderlineIcon />
                    </button>
                    <button
                        type="button"
                        onClick={() => customCommand(editor, 'setMark', 'overline')}
                        className={editor?.isActive('overline') ? 'active' : ''}
                        title="Overline"
                    >
                        <OverlineIcon />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleStrike().run()}
                        className={editor?.isActive('strike') ? 'active' : ''}
                        title="Strikethrough"
                    >
                        <StrikethroughIcon />
                    </button>
                </div>
                <div>
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={editor?.isActive('heading', { level: 1 }) ? 'active' : ''}
                        title="Heading 1"
                    >
                        <Heading1Icon />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={editor?.isActive('heading', { level: 2 }) ? 'active' : ''}
                        title="Heading 2"
                    >
                        <Heading2Icon />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={editor?.isActive('heading', { level: 3 }) ? 'active' : ''}
                        title="Heading 3"
                    >
                        <Heading3Icon />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleHeading({ level: 4 }).run()}
                        className={editor?.isActive('heading', { level: 4 }) ? 'active' : ''}
                        title="Heading 4"
                    >
                        <Heading4Icon />
                    </button>
                </div>
                <div>
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleBulletList().run()}
                        className={editor?.isActive('bulletList') ? 'active' : ''}
                        title="Bullet List"
                    >
                        <UnorderedListIcon />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                        className={editor?.isActive('orderedList') ? 'active' : ''}
                        title="Ordered List"
                    >
                        <OrderedListIcon />
                    </button>
                </div>
                <div>
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().setLink({ href: 'https://example.com' }).run()}
                        className={editor?.isActive('link') ? 'active' : ''}
                        title="Link"
                    >
                        <LinkIcon />
                    </button>
                    <button
                        type="button"
                        onClick={() => customCommand(editor, 'setImage', { src: 'https://example.com/image.jpg' })}
                        title="Image"
                    >
                        <ImageIcon />
                    </button>
                    <button
                        type="button"
                        onClick={() => customCommand(editor, 'setVideo', { src: 'https://example.com/video.mp4' })}
                        title="Video"
                    >
                        <VideoIcon />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                        className={editor?.isActive('blockquote') ? 'active' : ''}
                        title="Blockquote"
                    >
                        <BlockquoteIcon />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
                        className={editor?.isActive('codeBlock') ? 'active' : ''}
                        title="Code Block"
                    >
                        <CodeBlockIcon />
                    </button>
                </div>
                <div>
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                        className={editor?.isActive({ textAlign: 'left' }) ? 'active' : ''}
                        title="Align Left"
                    >
                        <AlignLeftIcon />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                        className={editor?.isActive({ textAlign: 'center' }) ? 'active' : ''}
                        title="Align Center"
                    >
                        <AlignCenterIcon />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                        className={editor?.isActive({ textAlign: 'right' }) ? 'active' : ''}
                        title="Align Right"
                    >
                        <AlignRightIcon />
                    </button>
                </div>
                <div>
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleSuperscript().run()}
                        className={editor?.isActive('superscript') ? 'active' : ''}
                        title="Superscript"
                    >
                        <SuperscriptIcon />
                    </button>
                    <button
                        type="button"
                        onClick={() => editor?.chain().focus().toggleSubscript().run()}
                        className={editor?.isActive('subscript') ? 'active' : ''}
                        title="Subscript"
                    >
                        <SubscriptIcon />
                    </button>
                </div>
            </div>
            <EditorContent editor={editor} className="editor-content" />
        </div>
    );
}

export default TiptapEditor;