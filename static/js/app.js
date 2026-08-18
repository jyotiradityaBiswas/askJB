const MESSAGE_LIMIT = 300;
const REPLY_LIMIT = 500;
const QUESTION_PREVIEW_LIMIT = 50;


const form =
    document.querySelector("#message-form");

const textarea =
    document.querySelector("#message");

const counter =
    document.querySelector(".counter");

const successModal =
    document.querySelector("#success-modal");

const successClose =
    document.querySelector("#success-close");


/* =========================
   MESSAGE FORM
========================= */

if (form && textarea && counter) {

    textarea.maxLength =
        MESSAGE_LIMIT;


    function updateMessageCounter() {

        if (
            textarea.value.length >
            MESSAGE_LIMIT
        ) {
            textarea.value =
                textarea.value.slice(
                    0,
                    MESSAGE_LIMIT
                );
        }

        counter.textContent =
            `${textarea.value.length} / ${MESSAGE_LIMIT}`;
    }


    textarea.addEventListener(
        "input",
        updateMessageCounter
    );


    textarea.addEventListener(
        "paste",
        () => {
            requestAnimationFrame(
                updateMessageCounter
            );
        }
    );


    updateMessageCounter();


    form.addEventListener(
        "submit",
        async (event) => {

            event.preventDefault();


            const message =
                textarea.value
                    .trim()
                    .slice(
                        0,
                        MESSAGE_LIMIT
                    );


            if (!message) {
                return;
            }


            const button =
                form.querySelector(
                    "button"
                );


            button.disabled = true;
            button.textContent =
                "Sending...";


            try {

                const response =
                    await fetch(
                        "/send",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    message
                                })
                        }
                    );


                const data =
                    await response.json();


                if (!response.ok) {
                    throw new Error(
                        data.error ||
                        "Something went wrong."
                    );
                }


                textarea.value = "";

                counter.textContent =
                    `0 / ${MESSAGE_LIMIT}`;


                /* =========================
                   SHOW SUCCESS POPUP
                ========================= */

                if (successModal) {
                    successModal.classList.add(
                        "active"
                    );
                }


            } catch (error) {

                console.error(
                    "Send error:",
                    error
                );

                alert(
                    error.message ||
                    "Something went wrong."
                );


            } finally {

                button.disabled = false;

                button.textContent =
                    "Send anonymously";
            }
        }
    );
}


/* =========================
   SUCCESS MODAL
========================= */

if (successModal) {

    const successBackdrop =
        successModal.querySelector(
            ".success-modal-backdrop"
        );


    function closeSuccessModal() {

        successModal.classList.remove(
            "active"
        );
    }


    if (successClose) {

        successClose.addEventListener(
            "click",
            closeSuccessModal
        );
    }


    if (successBackdrop) {

        successBackdrop.addEventListener(
            "click",
            closeSuccessModal
        );
    }
}


/* =========================
   REPLY SYSTEM
========================= */

const replyButtons =
    document.querySelectorAll(
        ".reply-button"
    );

const modal =
    document.querySelector("#reply-modal");

const modalClose =
    document.querySelector("#modal-close");

const questionPreview =
    document.querySelector("#question-preview");

const replyText =
    document.querySelector("#reply-text");

const replyCounter =
    document.querySelector("#reply-counter");

const generateCard =
    document.querySelector("#generate-card");

const storyPreview =
    document.querySelector("#story-preview");

let currentMessageId = null;


async function markMessageAsRead(messageId) {
    if (!messageId) {
        return;
    }

    try {
        const response =
            await fetch(
                `/messages/${messageId}/read`,
                {
                    method: "POST"
                }
            );

        if (!response.ok) {
            throw new Error(
                "Failed to mark message as read."
            );
        }

        const messageButton =
            document.querySelector(
                `.reply-button[data-message-id="${messageId}"]`
            );

        if (!messageButton) {
            return;
        }

        const messageCard =
            messageButton.closest(
                ".message-card"
            );

        if (!messageCard) {
            return;
        }

        const messageStatus =
            messageCard.querySelector(
                ".message-status"
            );

        if (messageStatus) {
            messageStatus.textContent =
                "READ";

            messageStatus.classList.add(
                "is-read"
            );
        }
    } catch (error) {
        console.error(error);
    }
}


if (
    replyButtons.length &&
    modal &&
    modalClose &&
    questionPreview &&
    replyText &&
    replyCounter &&
    generateCard &&
    storyPreview
) {
    replyText.maxLength = REPLY_LIMIT;

    replyButtons.forEach((button) => {
        button.addEventListener(
            "click",
            async () => {
                const fullQuestion =
                    button.dataset.message || "";

                currentMessageId =
                    button.dataset.messageId || null;

                questionPreview.dataset.fullQuestion =
                    fullQuestion;

                questionPreview.textContent =
                    fullQuestion.length >
                    QUESTION_PREVIEW_LIMIT
                        ? `${fullQuestion.slice(
                            0,
                            QUESTION_PREVIEW_LIMIT
                        )}...`
                        : fullQuestion;

                replyText.value = "";

                replyCounter.textContent =
                    `0 / ${REPLY_LIMIT}`;

                storyPreview.removeAttribute(
                    "src"
                );

                modal.classList.add(
                    "active"
                );

                replyText.focus();

                await markMessageAsRead(
                    currentMessageId
                );
            }
        );
    });


    function closeModal() {
        modal.classList.remove(
            "active"
        );
    }


    modalClose.addEventListener(
        "click",
        closeModal
    );


    const backdrop =
        modal.querySelector(
            ".reply-modal-backdrop"
        );

    if (backdrop) {
        backdrop.addEventListener(
            "click",
            closeModal
        );
    }


    function updateReplyCounter() {
        if (
            replyText.value.length >
            REPLY_LIMIT
        ) {
            replyText.value =
                replyText.value.slice(
                    0,
                    REPLY_LIMIT
                );
        }

        replyCounter.textContent =
            `${replyText.value.length} / ${REPLY_LIMIT}`;

        updateStoryPreview();
    }


    replyText.addEventListener(
        "input",
        updateReplyCounter
    );


    replyText.addEventListener(
        "paste",
        () => {
            requestAnimationFrame(
                updateReplyCounter
            );
        }
    );


    generateCard.addEventListener(
        "click",
        () => {
            const question =
                questionPreview.dataset.fullQuestion ||
                questionPreview.textContent.trim();

            const reply =
                replyText.value
                    .trim()
                    .slice(0, REPLY_LIMIT);

            if (!reply) {
                replyText.focus();
                return;
            }

            const canvas =
                createStoryCard(
                    question,
                    reply,
                    currentMessageId
                );

            const link =
                document.createElement("a");

            link.download =
                "askJB-story.png";

            link.href =
                canvas.toDataURL(
                    "image/png"
                );

            link.click();

            closeModal();
        }
    );


    function updateStoryPreview() {
        const question =
            questionPreview.dataset.fullQuestion ||
            questionPreview.textContent.trim();

        const reply =
            replyText.value.trim();

        if (!question || !reply) {
            storyPreview.removeAttribute(
                "src"
            );

            return;
        }

        const canvas =
            createStoryCard(
                question,
                reply,
                currentMessageId
            );

        storyPreview.src =
            canvas.toDataURL(
                "image/png"
            );
    }
}


/* =========================
   STORY CARD
========================= */

function createStoryCard(
    question,
    reply,
    messageId
) {
    const canvas =
        document.createElement(
            "canvas"
        );

    canvas.width = 1080;
    canvas.height = 1920;

    const ctx =
        canvas.getContext("2d");

    const centerX =
        canvas.width / 2;


    /* =========================
       BACKGROUND
    ========================= */

    ctx.fillStyle =
        "#e7e7e3";

    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    /* =========================
       GRAIN
    ========================= */

    for (let i = 0; i < 4000; i++) {
        const x =
            Math.random() *
            canvas.width;

        const y =
            Math.random() *
            canvas.height;

        ctx.fillStyle =
            "rgba(0, 0, 0, 0.02)";

        ctx.fillRect(
            x,
            y,
            2,
            2
        );
    }


    /* =========================
       FIXED LAYOUT
    ========================= */

    const cardWidth = 940;

    const cardX =
        (canvas.width -
            cardWidth) / 2;

    const cardY = 390;
    const cardHeight = 520;

    const shadowOffset = 24;


    const questionX =
        cardX + 70;

    const questionWidth =
        cardWidth - 140;

    const questionTop =
        cardY + 100;

    const questionBottom =
        cardY +
        cardHeight -
        60;

    const questionHeight =
        questionBottom -
        questionTop;


    const replyTop = 1150;
    const replyBottom = 1600;

    const replyWidth = 820;

    const replyHeight =
        replyBottom -
        replyTop;


    /* =========================
       TEXT FITTING
    ========================= */

    const questionLayout =
        fitTextToArea(
            ctx,
            question,
            questionWidth,
            questionHeight,
            42,
            24,
            1.35
        );


    const replyLayout =
        fitTextToArea(
            ctx,
            reply,
            replyWidth,
            replyHeight,
            58,
            28,
            1.20
        );


    /* =========================
       HEADER
    ========================= */

    ctx.fillStyle =
        "#111";

    ctx.strokeStyle =
        "#111";

    ctx.textAlign =
        "left";

    ctx.font =
        "700 42px 'Space Grotesk'";

    ctx.fillText(
        "askJB",
        90,
        90
    );


    ctx.font =
        "700 24px 'Space Grotesk'";

    ctx.textAlign =
        "right";

    ctx.fillText(
        messageId
            ? `#${messageId}`
            : "#—",
        990,
        90
    );


    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(
        90,
        140
    );

    ctx.lineTo(
        990,
        140
    );

    ctx.stroke();


    /* =========================
       QUESTION LABEL
    ========================= */

    ctx.textAlign =
        "center";

    ctx.font =
        "700 22px 'Space Grotesk'";

    ctx.globalAlpha =
        0.45;

    ctx.fillText(
        "ANONYMOUS MESSAGE",
        centerX,
        cardY - 45
    );

    ctx.globalAlpha = 1;


    /* =========================
       CARD SHADOW
    ========================= */

    ctx.fillStyle =
        "#111";

    ctx.fillRect(
        cardX +
            shadowOffset,
        cardY +
            shadowOffset,
        cardWidth,
        cardHeight
    );


    /* =========================
       CARD
    ========================= */

    ctx.fillStyle =
        "#e7e7e3";

    ctx.strokeStyle =
        "#111";

    ctx.lineWidth = 5;

    ctx.fillRect(
        cardX,
        cardY,
        cardWidth,
        cardHeight
    );

    ctx.strokeRect(
        cardX,
        cardY,
        cardWidth,
        cardHeight
    );


    /* =========================
       CARD LABEL
    ========================= */

    ctx.fillStyle =
        "#111";

    ctx.font =
        "700 20px 'Space Grotesk'";

    ctx.globalAlpha =
        0.45;

    ctx.fillText(
        "ANONYMOUS",
        centerX,
        cardY + 55
    );

    ctx.globalAlpha = 1;


    /* =========================
       QUESTION
    ========================= */

    ctx.save();

    ctx.beginPath();

    ctx.rect(
        questionX,
        questionTop,
        questionWidth,
        questionHeight
    );

    ctx.clip();

    ctx.fillStyle =
        "#111";

    ctx.font =
        questionLayout.font;

    drawCenteredText(
        ctx,
        questionLayout.lines,
        centerX,
        questionTop,
        questionHeight,
        questionLayout.lineHeight
    );

    ctx.restore();


    /* =========================
       REPLY LABEL
    ========================= */

    ctx.fillStyle =
        "#111";

    ctx.font =
        "700 22px 'Space Grotesk'";

    ctx.globalAlpha =
        0.45;

    ctx.textAlign =
        "center";

    ctx.fillText(
        "MY REPLY",
        centerX,
        1080
    );

    ctx.globalAlpha = 1;


    /* =========================
       REPLY
    ========================= */

    ctx.save();

    ctx.beginPath();

    ctx.rect(
        centerX -
            replyWidth / 2,
        replyTop,
        replyWidth,
        replyHeight
    );

    ctx.clip();

    ctx.fillStyle =
        "#111";

    ctx.font =
        replyLayout.font;

    drawCenteredText(
        ctx,
        replyLayout.lines,
        centerX,
        replyTop,
        replyHeight,
        replyLayout.lineHeight
    );

    ctx.restore();


    /* =========================
       FOOTER
    ========================= */

    ctx.strokeStyle =
        "#111";

    ctx.lineWidth = 3;

    ctx.beginPath();

    ctx.moveTo(
        90,
        1710
    );

    ctx.lineTo(
        990,
        1710
    );

    ctx.stroke();


    ctx.fillStyle =
        "#111";

    ctx.font =
        "500 22px 'Space Grotesk'";

    ctx.textAlign =
        "left";

    ctx.globalAlpha =
        0.45;

    ctx.fillText(
        "askJB",
        90,
        1770
    );


    ctx.textAlign =
        "right";

    ctx.fillText(
        "ANONYMOUS Q&A",
        990,
        1770
    );

    ctx.globalAlpha = 1;


    return canvas;
}


/* =========================
   FIT TEXT TO AREA
========================= */

function fitTextToArea(
    ctx,
    text,
    maxWidth,
    maxHeight,
    startingSize,
    minimumSize,
    lineMultiplier
) {
    for (
        let size = startingSize;
        size >= minimumSize;
        size -= 2
    ) {
        const font =
            `500 ${size}px 'Space Grotesk'`;

        ctx.font = font;

        const lineHeight =
            Math.round(
                size *
                lineMultiplier
            );

        const lines =
            wrapText(
                ctx,
                text,
                maxWidth,
                font
            );

        const totalHeight =
            lines.length *
            lineHeight;

        if (
            totalHeight <=
            maxHeight
        ) {
            return {
                font,
                lines,
                lineHeight
            };
        }
    }


    const size =
        minimumSize;

    const font =
        `500 ${size}px 'Space Grotesk'`;

    ctx.font = font;

    const lineHeight =
        Math.round(
            size *
            lineMultiplier
        );

    const lines =
        wrapText(
            ctx,
            text,
            maxWidth,
            font
        );

    const maxLines =
        Math.max(
            1,
            Math.floor(
                maxHeight /
                lineHeight
            )
        );

    let visibleLines =
        lines.slice(
            0,
            maxLines
        );


    if (
        lines.length >
        maxLines
    ) {
        let lastLine =
            visibleLines[
                visibleLines.length - 1
            ] || "";

        while (
            ctx.measureText(
                `${lastLine}…`
            ).width >
                maxWidth &&
            lastLine.length > 0
        ) {
            lastLine =
                lastLine.slice(
                    0,
                    -1
                );
        }

        visibleLines[
            visibleLines.length - 1
        ] =
            `${lastLine}…`;
    }


    return {
        font,
        lines: visibleLines,
        lineHeight
    };
}


/* =========================
   WRAP TEXT
========================= */

function wrapText(
    ctx,
    text,
    maxWidth,
    font
) {
    ctx.font = font;

    const words =
        text
            .trim()
            .split(/\s+/);

    const lines = [];

    let line = "";


    for (
        const word of words
    ) {
        const testLine =
            line
                ? `${line} ${word}`
                : word;


        if (
            ctx.measureText(
                testLine
            ).width <=
            maxWidth
        ) {
            line =
                testLine;

            continue;
        }


        if (line) {
            lines.push(line);
            line = "";
        }


        let remaining =
            word;


        while (
            ctx.measureText(
                remaining
            ).width >
            maxWidth
        ) {
            let part = "";


            for (
                const character
                of remaining
            ) {
                const testPart =
                    part +
                    character;


                if (
                    ctx.measureText(
                        testPart
                    ).width >
                    maxWidth
                ) {
                    break;
                }


                part =
                    testPart;
            }


            if (!part) {
                break;
            }


            lines.push(part);

            remaining =
                remaining.slice(
                    part.length
                );
        }


        line =
            remaining;
    }


    if (line) {
        lines.push(line);
    }


    return lines;
}


/* =========================
   CENTER TEXT INSIDE AREA
========================= */

function drawCenteredText(
    ctx,
    lines,
    centerX,
    areaTop,
    areaHeight,
    lineHeight
) {
    const totalHeight =
        lines.length *
        lineHeight;


    const startY =
        areaTop +
        (
            areaHeight -
            totalHeight
        ) / 2 +
        lineHeight * 0.8;


    lines.forEach(
        (line, index) => {
            ctx.fillText(
                line,
                centerX,
                startY +
                index *
                    lineHeight
            );
        }
    );
}