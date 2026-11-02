
// ======================================
// CONFIGURATION
// ======================================

const whatsappNumber = "6287894857768";
const weddingDate = new Date("2026-12-12T08:00:00+07:00");


// ======================================
// GUEST NAME FROM URL
// ======================================

const urlParams = new URLSearchParams(window.location.search);
const guest = urlParams.get("to");

const guestName = document.getElementById("guestName");

if (guest && guestName) {
    guestName.textContent = guest.replace(/\+/g, " ");
}


// ======================================
// OPEN INVITATION
// ======================================

const opening = document.getElementById("opening");
const mainContent = document.getElementById("mainContent");
const openButton = document.getElementById("openInvitation");

const music = document.getElementById("weddingMusic");
const musicButton = document.getElementById("musicButton");

if (openButton) {
    openButton.addEventListener("click", async function () {

        if (opening) opening.classList.add("hidden");
        if (mainContent) mainContent.classList.remove("hidden");
        if (musicButton) musicButton.classList.remove("hidden");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        if (music) {
            try {
                await music.play();
                if (musicButton) musicButton.textContent = "♫";
            } catch (error) {
                if (musicButton) musicButton.textContent = "♪";
                console.log("Musik belum dapat diputar:", error);
            }
        }
    });
}


// ======================================
// MUSIC CONTROL
// ======================================

if (musicButton && music) {
    musicButton.addEventListener("click", function () {

        if (music.paused) {
            music.play().then(() => {
                musicButton.textContent = "♫";
            }).catch(() => {
                musicButton.textContent = "♪";
            });
        } else {
            music.pause();
            musicButton.textContent = "♪";
        }
    });
}


// ======================================
// COUNTDOWN
// ======================================

function updateCountdown() {

    const now = new Date().getTime();
    const distance = weddingDate.getTime() - now;

    const daysElement = document.getElementById("days");
    const hoursElement = document.getElementById("hours");
    const minutesElement = document.getElementById("minutes");
    const secondsElement = document.getElementById("seconds");
    const message = document.getElementById("countdownMessage");

    if (!daysElement || !hoursElement || !minutesElement || !secondsElement) {
        return;
    }

    if (distance <= 0) {
        daysElement.textContent = "00";
        hoursElement.textContent = "00";
        minutesElement.textContent = "00";
        secondsElement.textContent = "00";

        if (message) {
            message.textContent = "Hari bahagia kami telah tiba!";
        }
        return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    daysElement.textContent = String(days).padStart(2, "0");
    hoursElement.textContent = String(hours).padStart(2, "0");
    minutesElement.textContent = String(minutes).padStart(2, "0");
    secondsElement.textContent = String(seconds).padStart(2, "0");
}

updateCountdown();
setInterval(updateCountdown, 1000);


// ======================================
// RSVP FORM
// ======================================

const rsvpForm = document.getElementById("rsvpForm");

if (rsvpForm) {
    rsvpForm.addEventListener("submit", function (event) {

        event.preventDefault();

        const name = document.getElementById("rsvpName").value.trim();
        const attendance = document.getElementById("attendance").value;
        const guestCount = document.getElementById("guestCount").value;

        if (!name || !attendance) {
            alert("Silakan lengkapi data terlebih dahulu.");
            return;
        }

        const message =
            `Assalamu'alaikum, saya ingin mengonfirmasi kehadiran.\n\n` +
            `Nama: ${name}\n` +
            `Konfirmasi: ${attendance}\n` +
            `Jumlah tamu: ${guestCount} orang\n\n` +
            `Terima kasih.`;

        const whatsappURL =
            `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

        window.open(whatsappURL, "_blank");
    });
}


// ======================================
// SUPABASE CONFIGURATION
// ======================================

const SUPABASE_URL = "https://raopapvsvpmwkseamkoa.supabase.co";

// Pertahankan Publishable Key milikmu di sini.
const SUPABASE_KEY = "sb_publishable_0QTcia1jtq9EOC47iNf3jw_HFE-DO64";

let supabaseClient = null;

if (window.supabase) {
    supabaseClient = window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );
} else {
    console.error("Library Supabase belum berhasil dimuat.");
}


// ======================================
// WEDDING WISHES
// ======================================

const wishForm = document.getElementById("wishForm");
const wishList = document.getElementById("wishList");

async function loadWishes() {

    if (!wishList || !supabaseClient) return;

    wishList.textContent = "Memuat ucapan...";

    const { data, error } = await supabaseClient
        .from("wedding_wishes")
        .select("name, message, created_at")
        .order("created_at", { ascending: false })
        .limit(50);

    if (error) {
        wishList.textContent = "Gagal memuat ucapan. Silakan coba lagi.";
        console.error("Supabase:", error);
        return;
    }

    wishList.innerHTML = "";

    if (!data || data.length === 0) {
        wishList.textContent = "Belum ada ucapan. Jadilah yang pertama!";
        return;
    }

    data.forEach(function (wish) {

        const item = document.createElement("div");
        item.className = "wish-item";

        const name = document.createElement("h4");
        name.textContent = wish.name;

        const message = document.createElement("p");
        message.textContent = wish.message;

        item.appendChild(name);
        item.appendChild(message);

        wishList.appendChild(item);
    });
}


// SEND WISHES

if (wishForm) {
    wishForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        if (!supabaseClient) {
            alert("Koneksi database belum tersedia.");
            return;
        }

        const name = document.getElementById("wishName").value.trim();
        const message = document.getElementById("wishMessage").value.trim();

        if (!name || !message) {
            alert("Nama dan ucapan wajib diisi.");
            return;
        }

        if (name.length > 60 || message.length > 500) {
            alert("Nama maksimal 60 karakter dan ucapan maksimal 500 karakter.");
            return;
        }

        const submitButton = wishForm.querySelector("button");

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Mengirim...";
        }

        try {
            const { error } = await supabaseClient
                .from("wedding_wishes")
                .insert([{ name, message }]);

            if (error) throw error;

            alert("Terima kasih! Ucapan berhasil dikirim.");

            wishForm.reset();
            await loadWishes();

        } catch (error) {
            alert("Ucapan gagal dikirim. Silakan coba kembali.");
            console.error("Supabase:", error);
        }

        if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Kirim Ucapan";
        }
    });
}

loadWishes();


// ======================================
// COPY BANK ACCOUNT
// ======================================

const copyButton = document.getElementById("copyAccount");

if (copyButton) {
    copyButton.addEventListener("click", async function () {

        const accountElement = document.getElementById("accountNumber");

        if (!accountElement) return;

        const accountNumber = accountElement.textContent.trim();

        try {
            await navigator.clipboard.writeText(accountNumber);
        } catch (error) {
            const temporaryInput = document.createElement("textarea");

            temporaryInput.value = accountNumber;
            document.body.appendChild(temporaryInput);

            temporaryInput.select();
            document.execCommand("copy");

            temporaryInput.remove();
        }

        copyButton.textContent = "Berhasil Disalin!";

        setTimeout(function () {
            copyButton.textContent = "Salin Nomor Rekening";
        }, 2000);
    });
}
