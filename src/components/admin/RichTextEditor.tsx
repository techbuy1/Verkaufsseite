"use client";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function exec(command: string, value?: string) {
  document.execCommand(command, false, value);
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-[#d2d2d7]/60 bg-white">
      <div className="flex flex-wrap gap-1 border-b border-[#d2d2d7]/40 bg-[#f5f5f7]/80 p-2">
        {[
          { label: "B", cmd: "bold" },
          { label: "H2", cmd: "formatBlock", arg: "h2" },
          { label: "Liste", cmd: "insertUnorderedList" },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onMouseDown={(event) => {
              event.preventDefault();
              exec(item.cmd, item.arg);
            }}
            className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-[#1d1d1f] hover:bg-white"
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onMouseDown={(event) => {
            event.preventDefault();
            const url = window.prompt("Link-URL");
            if (url) exec("createLink", url);
          }}
          className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-[#1d1d1f] hover:bg-white"
        >
          Link
        </button>
      </div>
      <div
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        className="min-h-[160px] px-4 py-3 text-[14px] leading-relaxed text-[#1d1d1f] outline-none [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-[18px] [&_h2]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-3 [&_ul]:list-disc"
        onInput={(event) => onChange(event.currentTarget.innerHTML)}
        dangerouslySetInnerHTML={{ __html: value }}
      />
    </div>
  );
}
