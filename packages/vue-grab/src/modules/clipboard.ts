export const copyTextToClipboard = async (text: string) => {
  // Simple approach: use clipboard API if available, fallback to textarea
  const anyNav: any = navigator as any;
  if (anyNav?.clipboard?.writeText) {
    await anyNav.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.outline = "none";
  textarea.style.border = "none";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(textarea);
  }
};