// Data dummy untuk jadwal dokter, sesuai tanggal saat ini (9 Juni 2025)
const schedules = {
    kebidanan: [
        { date: "2025-06-09", time: "17:00", doctor: "Dr. Ani", capacity: 20, patients: [] },
        { date: "2025-06-10", time: "14:00", doctor: "Dr. Budi", capacity: 20, patients: [] }
    ],
    umum: [{ date: "2025-06-09", time: "17:30", doctor: "Dr. Cita", capacity: 20, patients: [] }],
    "penyakit-dalam": [{ date: "2025-06-10", time: "11:00", doctor: "Dr. Dedi", capacity: 20, patients: [] }],
    gigi: [{ date: "2025-06-09", time: "18:00", doctor: "Dr. Eka", capacity: 20, patients: [] }]
};

// Data dummy untuk pengguna
const users = {
    patient: { username: "pasien1", password: "pasien123", role: "patient" },
    doctor: { username: "dokter1", password: "dokter123", role: "doctor" },
    admin: { username: "admin1", password: "admin123", role: "admin" }
};

// Toggle navbar pada layar kecil
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
hamburger.addEventListener("click", () => {
    navMenu.classList.toggle("active");
    hamburger.classList.toggle("open");
});

// Toggle bahasa (visual saja)
document.querySelectorAll(".lang").forEach(lang => {
    lang.addEventListener("click", (e) => {
        e.preventDefault();
        document.querySelector(".lang.active").classList.remove("active");
        lang.classList.add("active");
    });
});

// Fungsi untuk memperbarui status operasional dan waktu di Info Cepat
function updateOperationalStatus() {
    const statusText = document.getElementById("status-text");
    const currentTimeElement = document.getElementById("current-time");
    
    const now = new Date(); // Use current time (05:21 PM WIB, June 9, 2025)
    const hours = now.getHours();
    const minutes = now.getMinutes();
    
    // Update waktu saat ini
    currentTimeElement.textContent = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} WIB`;

    // Periksa status operasional (08:00 - 20:00 WIB)
    const startHour = 8;
    const endHour = 20;
    if (hours >= startHour && hours < endHour) {
        statusText.textContent = "Buka";
        statusText.classList.add("open");
        statusText.classList.remove("closed");
    } else {
        statusText.textContent = "Tutup";
        statusText.classList.add("closed");
        statusText.classList.remove("open");
    }
}

// Fungsi login
function login(event) {
    event.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role-select").value;
    const error = document.getElementById("login-error");

    const user = users[role];
    if (user && username === user.username && password === user.password) {
        document.getElementById("login-section").classList.add("hidden");
        document.getElementById("login-link").classList.add("hidden");
        document.getElementById("start-link").classList.add("hidden"); // Sembunyikan tombol "Mulai Sekarang"
        document.querySelector(".container").style.display = "flex"; // Tampilkan container setelah login
        if (role === "patient") {
            document.getElementById("patient-section").classList.remove("hidden");
            updateScheduleOptions();
        } else if (role === "doctor") {
            document.getElementById("doctor-section").classList.remove("hidden");
            updateDoctorSchedule();
        } else if (role === "admin") {
            document.getElementById("admin-section").classList.remove("hidden");
            updateAdminRecap();
        }
        navMenu.classList.remove("active");
        error.textContent = "";
    } else {
        error.textContent = "Username atau password salah!";
        error.style.opacity = "1";
        setTimeout(() => (error.style.opacity = "0"), 3000);
    }
}

// Fungsi logout
function logout() {
    // Hide all card sections
    document.querySelectorAll(".card").forEach(card => card.classList.add("hidden"));
    
    // Show login section
    document.getElementById("login-section").classList.remove("hidden");
    
    // Show login and start links
    document.getElementById("login-link").classList.remove("hidden");
    document.getElementById("start-link").classList.remove("hidden");
    
    // Ensure container is visible to show login section
    document.querySelector(".container").style.display = "flex";
    
    // Hide splash screen
    document.querySelector(".splash-screen").style.display = "none";
    
    // Reset login form
    document.getElementById("login-form").reset();
    
    // Hide patient confirmation
    document.getElementById("patient-confirmation").classList.add("hidden");
    
    // Close mobile navigation menu
    navMenu.classList.remove("active");
}

// Fungsi untuk memperbarui opsi jadwal
function updateScheduleOptions() {
    const poli = document.getElementById("poli-select").value;
    const scheduleSelect = document.getElementById("schedule-select");
    scheduleSelect.innerHTML = "";
    schedules[poli].forEach((sched, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = `${sched.date} ${sched.time} - ${sched.doctor} (${sched.patients.length}/${sched.capacity})`;
        scheduleSelect.appendChild(option);
    });
}

// Fungsi untuk mendaftar pasien
function registerPatient(event) {
    event.preventDefault();
    const patientName = document.getElementById("patient-name").value;
    const poli = document.getElementById("poli-select").value;
    const scheduleIndex = document.getElementById("schedule-select").value;
    const confirmation = document.getElementById("patient-confirmation");
    const confirmationText = document.getElementById("confirmation-text");
    const qrCodeDiv = document.getElementById("qrcode");

    if (!patientName) {
        confirmationText.textContent = "Nama wajib diisi!";
        confirmation.classList.remove("hidden");
        return;
    }

    const selectedSchedule = schedules[poli][scheduleIndex];
    if (selectedSchedule.patients.length >= selectedSchedule.capacity) {
        confirmationText.textContent = "Jadwal penuh!";
        confirmation.classList.remove("hidden");
        return;
    }

    const queueNumber = selectedSchedule.patients.length + 1;
    const estimatedTime = calculateEstimatedTime(selectedSchedule.time, queueNumber);
    selectedSchedule.patients.push({ name: patientName, queue: queueNumber });

    confirmationText.textContent = `Berhasil! Antrian: ${queueNumber}, Estimasi: ${estimatedTime}`;
    confirmation.classList.remove("hidden");

    qrCodeDiv.innerHTML = "";
    const qrText = `Antrian: ${queueNumber}\nNama: ${patientName}\nPoli: ${poli}\nDokter: ${selectedSchedule.doctor}\nTanggal: ${selectedSchedule.date}\nWaktu: ${selectedSchedule.time}`;
    new QRCode(qrCodeDiv, {
        text: qrText,
        width: 128,
        height: 128,
        colorDark: "#2a4066",
        colorLight: "#fff",
        correctLevel: QRCode.CorrectLevel.H
    });

    updateDoctorSchedule();
    document.getElementById("registration-form").reset();
}

// Fungsi menghitung estimasi waktu
function calculateEstimatedTime(startTime, queueNumber) {
    const [hour, minute] = startTime.split(":").map(Number);
    const totalMinutes = hour * 60 + minute + queueNumber * 10;
    const newHour = Math.floor(totalMinutes / 60);
    const newMinute = totalMinutes % 60;
    return `${newHour.toString().padStart(2, "0")}:${newMinute.toString().padStart(2, "0")}`;
}

// Fungsi untuk menampilkan jadwal dokter
function updateDoctorSchedule() {
    const doctorScheduleDiv = document.getElementById("doctor-schedule");
    doctorScheduleDiv.innerHTML = "";
    Object.keys(schedules).forEach(poli => {
        schedules[poli].forEach(sched => {
            const scheduleItem = document.createElement("div");
            scheduleItem.className = "schedule-item";
            scheduleItem.innerHTML = `<h4>${poli} - ${sched.date} ${sched.time} (${sched.doctor})</h4><p>Pasien: ${sched.patients.length}/${sched.capacity}</p>`;
            if (sched.patients.length > 0) {
                const patientList = document.createElement("div");
                patientList.className = "patient-list";
                sched.patients.forEach(patient => {
                    const patientItem = document.createElement("div");
                    patientItem.className = "patient-item";
                    patientItem.textContent = `${patient.name} (Antrian: ${patient.queue})`;
                    patientList.appendChild(patientItem);
                });
                scheduleItem.appendChild(patientList);
            } else {
                scheduleItem.innerHTML += `<p>Tidak ada pasien.</p>`;
            }
            doctorScheduleDiv.appendChild(scheduleItem);
        });
    });
}

// Fungsi untuk menampilkan rekap admin
function updateAdminRecap() {
    const adminRecapDiv = document.getElementById("admin-recap");
    adminRecapDiv.innerHTML = "";
    Object.keys(schedules).forEach(poli => {
        const totalPatients = schedules[poli].reduce((sum, sched) => sum + sched.patients.length, 0);
        const p = document.createElement("p");
        p.textContent = `${poli}: ${totalPatients} pasien`;
        adminRecapDiv.appendChild(p);
    });
}

// Event listeners
document.addEventListener("DOMContentLoaded", () => {
    updateOperationalStatus(); // Panggil fungsi untuk memperbarui Info Cepat
    document.getElementById("login-form").addEventListener("submit", login);
    document.getElementById("registration-form").addEventListener("submit", registerPatient);
    document.getElementById("poli-select").addEventListener("change", updateScheduleOptions);
    document.querySelectorAll("#login-link, #start-link").forEach(link => {
        link.addEventListener("click", () => {
            document.getElementById("login-section").classList.remove("hidden");
            document.querySelector(".splash-screen").style.display = "none";
            document.querySelector(".container").style.display = "flex";
            navMenu.classList.remove("active");
        });
    });
    document.querySelectorAll(".nav-menu a").forEach(link => {
        link.addEventListener("click", (e) => e.preventDefault());
    });

    // Tambahkan event listener untuk tombol logout di setiap section
    document.getElementById("logout-patient").addEventListener("click", logout);
    document.getElementById("logout-doctor").addEventListener("click", logout);
    document.getElementById("logout-admin").addEventListener("click", logout);

    // Panggil fungsi untuk memastikan konten awal dimuat setelah login
    updateScheduleOptions();
    updateDoctorSchedule();
    updateAdminRecap();
});
