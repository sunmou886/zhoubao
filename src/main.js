const copyButtons = Array.from(document.querySelectorAll("[data-copy-btn]"));

function fallbackCopy(text) {
  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  let success = false;
  try {
    success = document.execCommand("copy");
  } catch {
    success = false;
  }

  document.body.removeChild(textArea);
  return success;
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }

  return fallbackCopy(text);
}

function normalizeCopiedText(raw) {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .join("\n");
}

function setIconState(button, state) {
  const copyIcon = button.querySelector('[data-icon="copy"]');
  const checkIcon = button.querySelector('[data-icon="check"]');

  if (state === "success") {
    copyIcon?.classList.add("hidden");
    checkIcon?.classList.remove("hidden");
    return;
  }

  copyIcon?.classList.remove("hidden");
  checkIcon?.classList.add("hidden");
}

for (const button of copyButtons) {
  button.addEventListener("click", async () => {
    const card = button.closest("[data-card]");
    const body = card?.querySelector("[data-copy-body]");
    const rawContent = body?.textContent ?? "";
    const content = normalizeCopiedText(rawContent);

    if (!content) {
      return;
    }

    button.disabled = true;

    try {
      const ok = await copyText(content);
      if (!ok) {
        throw new Error("copy failed");
      }

      setIconState(button, "success");
      button.title = "已复制";
      button.setAttribute("aria-label", "已复制");
    } catch {
      button.title = "复制失败";
      button.setAttribute("aria-label", "复制失败");
    }

    setTimeout(() => {
      setIconState(button, "idle");
      button.title = "复制正文";
      button.setAttribute("aria-label", "复制正文");
      button.disabled = false;
    }, 1100);
  });
}
