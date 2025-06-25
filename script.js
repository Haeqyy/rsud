const schedules = {
    kebidanan: [
        { date: "2025-06-16", time: "17:00", doctor: "drani", capacity: 20, patients: [], approved: [] },
        { date: "2025-06-17", time: "14:00", doctor: "drbudi", capacity: 20, patients: [], approved: [] }
    ],
    umum: [
        { date: "2025-06-16", time: "17:30", doctor: "drcita", capacity: 20, patients: [], approved: [] },
        { date: "2025-06-18", time: "09:00", doctor: "drdewi", capacity: 15, patients: [], approved: [] }
    ],
    "penyakit-dalam": [
        { date: "2025-06-17", time: "11:00", doctor: "drdedi", capacity: 20, patients: [], approved: [] }
    ],
    gigi: [
        { date: "2025-06-16", time: "18:00", doctor: "dreka", capacity: 20, patients: [], approved: [] }
    ]
};

const users = {
    patients: {},
    doctors: {
        drani: { 
            username: "drani", 
            password: "drani123", 
            role: "doctor",
            biodata: { name: "Dr. Ani Susanti", specialty: "Kebidanan", phone: "+62 811 123 456", email: "ani@rsudelima.com" }
        },
        drbudi: { 
            username: "drbudi", 
            password: "drbudi123", 
            role: "doctor",
            biodata: { name: "Dr. Budi Santoso", specialty: "Kebidanan", phone: "+62 811 234 567", email: "budi@rsudelima.com" }
        },
        drcita: { 
            username: "drcita", 
            password: "drcita123", 
            role: "doctor",
            biodata: { name: "Dr. Cita Lestari", specialty: "Umum", phone: "+62 811 345 678", email: "cita@rsudelima.com" }
        },
        drdewi: { 
            username: "drdewi", 
            password: "drdewi123", 
            role: "doctor",
            biodata: { name: "Dr. Dewi Puspita", specialty: "Umum", phone: "+62 811 456 789", email: "dewi@rsudelima.com" }
        },
        drdedi: { 
            username: "drdedi", 
            password: "drdedi123", 
            role: "doctor",
            biodata: { name: "Dr. Dedi Pratama", specialty: "Penyakit Dalam", phone: "+62 811 567 890", email: "dedi@rsudelima.com" }
        },
        dreka: { 
            username: "dreka", 
            password: "dreka123", 
            role: "doctor",
            biodata: { name: "Dr. Eka Sari", specialty: "Gigi", phone: "+62 811 678 901", email: "eka@rsudelima.com" }
        }
    },
    admin: { username: "admin1", password: "admin123", role: "admin" }
};

function showMessage(elementId, message, isError = false) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.color = isError ? "red" : "green";
        element.style.opacity = "1";
        setTimeout(() => (element.style.opacity = "0"), 3000);
    }
}

const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");
if (hamburger && navMenu) {
    hamburger.addEventListener("click", () => {
        navMenu.classList.toggle("active");
        hamburger.classList.toggle("open");
    });
}

document.querySelectorAll(".lang").forEach(lang => {
    lang.addEventListener("click", (e) => {
        e.preventDefault();
        const activeLang = document.querySelector(".lang.active");
        if (activeLang) activeLang.classList.remove("active");
        lang.classList.add("active");
    });
});

function updateOperationalStatus() {
    const statusText = document.getElementById("status-text");
    const currentTimeElement = document.getElementById("current-time");
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateElement = document.querySelector('.sidebar-content ul li:nth-child(4)');
    if (dateElement) {
        dateElement.textContent = `Tanggal: ${now.toLocaleDateString('id-ID', options)}`;
    }
    const hours = now.getHours();
    const minutes = now.getMinutes();
    if (currentTimeElement) {
        currentTimeElement.textContent = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} WIB`;
    }
    if (statusText) {
        if (hours >= 8 && hours < 20) {
            statusText.textContent = "Buka";
            statusText.classList.add("open");
            statusText.classList.remove("closed");
        } else {
            statusText.textContent = "Tutup";
            statusText.classList.add("closed");
            statusText.classList.remove("open");
        }
    }
}

let currentUser = null;

function login(event) {
    event.preventDefault();
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const roleSelect = document.getElementById("role-select");
    const loginError = document.getElementById("login-error");

    if (!usernameInput || !passwordInput || !roleSelect || !loginError) {
        console.error("Login form elements not found.");
        return;
    }

    const username = usernameInput.value.toLowerCase();
    const password = passwordInput.value;
    const role = roleSelect.value;

    if (role === "patient") {
        const patient = users.patients[username];
        if (!patient) {
            users.patients[username] = { username, password, role: "patient", birthdate: "", medicalRecord: "" };
            showMessage("login-error", "Akun pasien baru dibuat! Silakan login kembali.", false);
            return;
        } else if (patient.password === password) {
            currentUser = { ...patient, username };
            document.getElementById("login-section").classList.add("hidden");
            document.querySelector(".container").style.display = "flex";
            document.getElementById("patient-section").classList.remove("hidden");
            displayPatientDoctorSchedule();
            populatePoliDropdown("poli-select");
            updateScheduleOptions();
            displayPatientAppointments();
        } else {
            showMessage("login-error", "Username atau password salah!", true);
        }
    } else if (role === "doctor") {
        const doctor = users.doctors[username];
        if (doctor && doctor.password === password) {
            currentUser = { ...doctor, username };
            document.getElementById("login-section").classList.add("hidden");
            document.querySelector(".container").style.display = "flex";
            document.getElementById("doctor-section").classList.remove("hidden");
            displayDoctorBiodata();
            updateDoctorSchedule();
        } else {
            showMessage("login-error", "Username atau password dokter salah!", true);
        }
    } else if (role === "admin") {
        const admin = users.admin;
        if (admin && username === admin.username && password === admin.password) {
            currentUser = { ...admin, username };
            document.getElementById("login-section").classList.add("hidden");
            document.querySelector(".container").style.display = "flex";
            document.getElementById("admin-section").classList.remove("hidden");
            updateAdminRecap();
            updateAdminPatientRecap();
            populatePoliDropdown("poli-select");
            populatePoliDropdown("admin-schedule-poli-select");
            populateDoctorDropdown();
        } else {
            showMessage("login-error", "Username atau password admin salah!", true);
        }
    }
    navMenu?.classList.remove("active");
}

function logout() {
    document.querySelectorAll(".card").forEach(card => card.classList.add("hidden"));
    document.getElementById("login-section")?.classList.remove("hidden");
    document.querySelector(".container").style.display = "flex";
    document.querySelector(".splash-screen").style.display = "none";
    document.getElementById("login-form")?.reset();
    document.getElementById("patient-confirmation")?.classList.add("hidden");
    navMenu?.classList.remove("active");
    currentUser = null;
}

function savePatientInfo(event) {
    event.preventDefault();
    const birthdateInput = document.getElementById("patient-birthdate");
    const medicalRecordInput = document.getElementById("patient-medical-record");
    if (!birthdateInput || !medicalRecordInput || !currentUser) return;

    const birthdate = birthdateInput.value;
    const medicalRecord = medicalRecordInput.value;

    if (!birthdate || !medicalRecord) {
        showMessage("patient-info-message", "Harap isi semua kolom!", true);
        return;
    }

    users.patients[currentUser.username].birthdate = birthdate;
    users.patients[currentUser.username].medicalRecord = medicalRecord;
    showMessage("patient-info-message", "Data pribadi berhasil disimpan!", false);
    document.getElementById("patient-info-form").reset();
}

function updateScheduleOptions() {
    const poliSelect = document.getElementById("poli-select");
    const scheduleSelect = document.getElementById("schedule-select");
    if (!poliSelect || !scheduleSelect) return;

    const poli = poliSelect.value;
    scheduleSelect.innerHTML = "";
    const sortedSchedules = (schedules[poli] || []).slice().sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
    });

    if (sortedSchedules.length > 0) {
        sortedSchedules.forEach((sched, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = `${sched.date} ${sched.time} - ${sched.doctor} (${sched.patients.length}/${sched.capacity})`;
            scheduleSelect.appendChild(option);
        });
    } else {
        const option = document.createElement("option");
        option.textContent = "Tidak ada jadwal tersedia";
        option.disabled = true;
        scheduleSelect.appendChild(option);
    }
}

function registerPatient(event) {
    event.preventDefault();
    const patientNameInput = document.getElementById("patient-name");
    const poliSelect = document.getElementById("poli-select");
    const scheduleSelect = document.getElementById("schedule-select");
    const confirmationDiv = document.getElementById("patient-confirmation");
    const confirmationText = document.getElementById("confirmation-text");
    const qrCodeDiv = document.getElementById("qrcode");

    if (!patientNameInput || !poliSelect || !scheduleSelect || !confirmationDiv || !confirmationText || !qrCodeDiv) return;

    const patientName = patientNameInput.value;
    const poli = poliSelect.value;
    const scheduleIndex = scheduleSelect.value;

    if (!patientName) {
        showMessage("confirmation-text", "Nama wajib diisi!", true);
        confirmationDiv.classList.remove("hidden");
        return;
    }

    if (!schedules[poli] || !schedules[poli][scheduleIndex]) {
        showMessage("confirmation-text", "Jadwal tidak valid!", true);
        confirmationDiv.classList.remove("hidden");
        return;
    }

    const selectedSchedule = schedules[poli][scheduleIndex];
    if (selectedSchedule.patients.length >= selectedSchedule.capacity) {
        showMessage("confirmation-text", "Jadwal penuh!", true);
        confirmationDiv.classList.remove("hidden");
        return;
    }

    const queueNumber = selectedSchedule.patients.length + 1;
    const estimatedTime = calculateEstimatedTime(selectedSchedule.time, queueNumber);
    selectedSchedule.patients.push({ name: patientName, queue: queueNumber, username: currentUser.username, status: "pending" });

    confirmationText.textContent = `Berhasil! Antrian: ${queueNumber}, Estimasi: ${estimatedTime} (Menunggu persetujuan dokter)`;
    confirmationDiv.classList.remove("hidden");

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
    updateAdminPatientRecap();
    displayPatientDoctorSchedule();
    updateScheduleOptions();
    displayPatientAppointments();
    document.getElementById("registration-form").reset();
}

function cancelAppointment(poli, scheduleIndex, patientIndex) {
    schedules[poli][scheduleIndex].patients.splice(patientIndex, 1);
    schedules[poli][scheduleIndex].patients.forEach((patient, index) => {
        patient.queue = index + 1;
    });
    updateDoctorSchedule();
    updateAdminPatientRecap();
    displayPatientDoctorSchedule();
    updateScheduleOptions();
    displayPatientAppointments();
    showMessage("confirmation-text", "Jadwal berhasil dibatalkan!", false);
}

function calculateEstimatedTime(startTime, queueNumber) {
    const [hour, minute] = startTime.split(":").map(Number);
    const totalMinutes = hour * 60 + minute + queueNumber * 10;
    const newHour = Math.floor(totalMinutes / 60);
    const newMinute = totalMinutes % 60;
    return `${newHour.toString().padStart(2, "0")}:${newMinute.toString().padStart(2, "0")}`;
}

function displayDoctorBiodata() {
    const biodataDiv = document.getElementById("doctor-biodata");
    if (!biodataDiv || !currentUser || !users.doctors[currentUser.username]) return;

    const biodata = users.doctors[currentUser.username].biodata;
    biodataDiv.innerHTML = `
        <p><strong>Nama:</strong> ${biodata.name}</p>
        <p><strong>Spesialisasi:</strong> ${biodata.specialty}</p>
        <p><strong>Telepon:</strong> ${biodata.phone}</p>
        <p><strong>Email:</strong> ${biodata.email}</p>
    `;
}

function updateDoctorSchedule() {
    const doctorScheduleDiv = document.getElementById("doctor-schedule");
    if (!doctorScheduleDiv || !currentUser) return;

    doctorScheduleDiv.innerHTML = "";
    const allSchedules = [];
    Object.keys(schedules).forEach(poli => {
        schedules[poli].forEach((sched, index) => {
            if (sched.doctor.toLowerCase() === currentUser.username.toLowerCase()) {
                allSchedules.push({ ...sched, poliName: poli, scheduleIndex: index });
            }
        });
    });

    allSchedules.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
    });

    if (allSchedules.length > 0) {
        let currentPoli = "";
        allSchedules.forEach(sched => {
            if (sched.poliName !== currentPoli) {
                const poliTitle = document.createElement("h5");
                poliTitle.textContent = `Poli ${sched.poliName.charAt(0).toUpperCase() + sched.poliName.slice(1)}`;
                doctorScheduleDiv.appendChild(poliTitle);
                currentPoli = sched.poliName;
            }

            const scheduleItem = document.createElement("div");
            scheduleItem.className = "schedule-item";
            scheduleItem.innerHTML = `
                <p><strong>${sched.date} ${sched.time}</strong> (${sched.patients.length}/${sched.capacity} pasien)</p>
            `;
            if (sched.patients.length > 0) {
                const patientList = document.createElement("ul");
                patientList.className = "patient-list ml-2";
                sched.patients.forEach((patient, patientIndex) => {
                    const patientData = users.patients[patient.username] || { birthdate: "Tidak tersedia", medicalRecord: "Tidak tersedia" };
                    const patientItem = document.createElement("li");
                    patientItem.innerHTML = `
                        ${patient.name} (Antrian: ${patient.queue}, Status: ${patient.status}) 
                        <br>Tanggal Lahir: ${patientData.birthdate || "Tidak tersedia"}
                        <br>Rekam Medis: ${patientData.medicalRecord || "Tidak tersedia"}
                        <br>
                        <button onclick="approvePatient('${sched.poliName}', ${sched.scheduleIndex}, ${patientIndex})">Setujui</button>
                        <button onclick="rejectPatient('${sched.poliName}', ${sched.scheduleIndex}, ${patientIndex})">Tolak</button>
                    `;
                    patientList.appendChild(patientItem);
                });
                scheduleItem.appendChild(patientList);
            } else {
                scheduleItem.innerHTML += `<p class="ml-2">Tidak ada pasien.</p>`;
            }
            doctorScheduleDiv.appendChild(scheduleItem);
        });
    } else {
        doctorScheduleDiv.innerHTML = "<p>Tidak ada jadwal yang tersedia.</p>";
    }
}

function approvePatient(poli, scheduleIndex, patientIndex) {
    schedules[poli][scheduleIndex].patients[patientIndex].status = "approved";
    schedules[poli][scheduleIndex].approved.push(schedules[poli][scheduleIndex].patients[patientIndex].username);
    updateDoctorSchedule();
    updateAdminPatientRecap();
    displayPatientAppointments();
    showMessage("doctor-schedule", "Pasien disetujui!", false);
}

function rejectPatient(poli, scheduleIndex, patientIndex) {
    schedules[poli][scheduleIndex].patients.splice(patientIndex, 1);
    schedules[poli][scheduleIndex].patients.forEach((patient, index) => {
        patient.queue = index + 1;
    });
    updateDoctorSchedule();
    updateAdminPatientRecap();
    displayPatientAppointments();
    showMessage("doctor-schedule", "Pasien ditolak!", false);
}

function displayPatientDoctorSchedule() {
    const patientDoctorScheduleDiv = document.getElementById("patient-doctor-schedule");
    if (!patientDoctorScheduleDiv) return;

    patientDoctorScheduleDiv.innerHTML = "";
    const now = new Date();
    const today = now.toISOString().split('T')[0];

    const schedulesToShow = [];
    Object.keys(schedules).forEach(poli => {
        schedules[poli].forEach(sched => {
            if (new Date(sched.date) >= new Date(today)) {
                schedulesToShow.push({ ...sched, poliName: poli });
            }
        });
    });

    schedulesToShow.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA - dateB;
    });

    if (schedulesToShow.length > 0) {
        schedulesToShow.forEach(sched => {
            const scheduleItem = document.createElement("div");
            scheduleItem.className = "schedule-item";
            scheduleItem.innerHTML = `
                <p><strong>Poli: ${sched.poliName.charAt(0).toUpperCase() + sched.poliName.slice(1)}</strong></p>
                <p>Dokter: ${sched.doctor}</p>
                <p>Tanggal: ${sched.date}</p>
                <p>Waktu: ${sched.time}</p>
                <p>Ketersediaan: ${sched.capacity - sched.patients.length} dari ${sched.capacity}</p>
            `;
            patientDoctorScheduleDiv.appendChild(scheduleItem);
        });
    } else {
        patientDoctorScheduleDiv.innerHTML = "<p>Tidak ada jadwal dokter yang tersedia saat ini.</p>";
    }
}

function displayPatientAppointments() {
    const patientAppointmentsDiv = document.getElementById("patient-appointments");
    if (!patientAppointmentsDiv || !currentUser) return;

    patientAppointmentsDiv.innerHTML = "";
    const appointments = [];
    Object.keys(schedules).forEach(poli => {
        schedules[poli].forEach((sched, scheduleIndex) => {
            sched.patients.forEach((patient, patientIndex) => {
                if (patient.username === currentUser.username) {
                    appointments.push({ ...sched, poliName: poli, scheduleIndex, patientIndex, patient });
                }
            });
        });
    });

    if (appointments.length > 0) {
        appointments.forEach(appointment => {
            const appointmentItem = document.createElement("div");
            appointmentItem.className = "schedule-item";
            appointmentItem.innerHTML = `
                <p><strong>Poli: ${appointment.poliName.charAt(0).toUpperCase() + appointment.poliName.slice(1)}</strong></p>
                <p>Dokter: ${appointment.doctor}</p>
                <p>Tanggal: ${appointment.date}</p>
                <p>Waktu: ${appointment.time}</p>
                <p>Antrian: ${appointment.patient.queue}</p>
                <p>Status: ${appointment.patient.status}</p>
                <button onclick="cancelAppointment('${appointment.poliName}', ${appointment.scheduleIndex}, ${appointment.patientIndex})">Batalkan</button>
            `;
            patientAppointmentsDiv.appendChild(appointmentItem);
        });
    } else {
        patientAppointmentsDiv.innerHTML = "<p>Belum ada jadwal yang terdaftar.</p>";
    }
}

function updateAdminRecap() {
    const adminRecapDiv = document.getElementById("admin-recap");
    if (!adminRecapDiv) return;

    adminRecapDiv.innerHTML = "";
    const recapData = {};
    Object.keys(schedules).forEach(poli => {
        recapData[poli] = [];
        schedules[poli].forEach((sched, scheduleIndex) => {
            if (sched.patients.length > 0) {
                recapData[poli].push({ ...sched, scheduleIndex });
            }
        });
    });

    if (Object.keys(recapData).length > 0) {
        Object.keys(recapData).forEach(poli => {
            if (recapData[poli].length > 0) {
                const poliTitle = document.createElement("h5");
                poliTitle.textContent = `Poli ${poli.charAt(0).toUpperCase() + poli.slice(1)}`;
                adminRecapDiv.appendChild(poliTitle);
                recapData[poli].forEach(sched => {
                    const scheduleItem = document.createElement("div");
                    scheduleItem.className = "schedule-item";
                    scheduleItem.innerHTML = `
                        <p><strong>${sched.date} ${sched.time}</strong> - ${sched.doctor} (${sched.patients.length}/${sched.capacity} pasien)</p>
                    `;
                    const patientList = document.createElement("ul");
                    patientList.className = "patient-list ml-2";
                    sched.patients.forEach(patient => {
                        const patientItem = document.createElement("li");
                        patientItem.textContent = `${patient.name} (Antrian: ${patient.queue}, Status: ${patient.status})`;
                        patientList.appendChild(patientItem);
                    });
                    scheduleItem.appendChild(patientList);
                    adminRecapDiv.appendChild(scheduleItem);
                });
            }
        });
    } else {
        adminRecapDiv.innerHTML = "<p>Belum ada data rekap layanan.</p>";
    }
}

function updateAdminPatientRecap() {
    const adminPatientRecapDiv = document.getElementById("admin-patient-recap");
    if (!adminPatientRecapDiv) return;

    adminPatientRecapDiv.innerHTML = "";
    const patientData = {};
    Object.keys(schedules).forEach(poli => {
        schedules[poli].forEach((sched, scheduleIndex) => {
            sched.patients.forEach(patient => {
                if (!patientData[patient.username]) {
                    patientData[patient.username] = {
                        name: patient.name,
                        appointments: [],
                        birthdate: users.patients[patient.username]?.birthdate || "Tidak tersedia",
                        medicalRecord: users.patients[patient.username]?.medicalRecord || "Tidak tersedia"
                    };
                }
                patientData[patient.username].appointments.push({
                    poli,
                    doctor: sched.doctor,
                    date: sched.date,
                    time: sched.time,
                    queue: patient.queue,
                    status: patient.status
                });
            });
        });
    });

    if (Object.keys(patientData).length > 0) {
        Object.keys(patientData).forEach(username => {
            const patient = patientData[username];
            const patientItem = document.createElement("div");
            patientItem.className = "schedule-item";
            patientItem.innerHTML = `
                <p><strong>Nama: ${patient.name}</strong></p>
                <p>Tanggal Lahir: ${patient.birthdate}</p>
                <p>Rekam Medis: ${patient.medicalRecord}</p>
            `;
            const appointmentList = document.createElement("ul");
            appointmentList.className = "patient-list ml-2";
            patient.appointments.forEach(appt => {
                const apptItem = document.createElement("li");
                apptItem.textContent = `Poli: ${appt.poli.charAt(0).toUpperCase() + appt.poli.slice(1)}, Dokter: ${appt.doctor}, Tanggal: ${appt.date}, Waktu: ${appt.time}, Antrian: ${appt.queue}, Status: ${appt.status}`;
                appointmentList.appendChild(apptItem);
            });
            patientItem.appendChild(appointmentList);
            adminPatientRecapDiv.appendChild(patientItem);
        });
    } else {
        adminPatientRecapDiv.innerHTML = "<p>Belum ada data pasien terdaftar.</p>";
    }
}

function populatePoliDropdown(selectId) {
    const selectElement = document.getElementById(selectId);
    if (!selectElement) return;
    selectElement.innerHTML = "";
    const poliNames = Object.keys(schedules).sort();
    if (poliNames.length > 0) {
        poliNames.forEach(poli => {
            const option = document.createElement("option");
            option.value = poli;
            option.textContent = poli.charAt(0).toUpperCase() + poli.slice(1);
            selectElement.appendChild(option);
        });
    } else {
        const option = document.createElement("option");
        option.textContent = "Tidak ada poli tersedia";
        option.disabled = true;
        selectElement.appendChild(option);
    }
}

function populateDoctorDropdown() {
    const selectElement = document.getElementById("admin-schedule-doctor");
    if (!selectElement) return;
    selectElement.innerHTML = "";
    const doctorNames = Object.keys(users.doctors).sort();
    if (doctorNames.length > 0) {
        doctorNames.forEach(doctor => {
            const option = document.createElement("option");
            option.value = doctor;
            option.textContent = users.doctors[doctor].biodata.name;
            selectElement.appendChild(option);
        });
    } else {
        const option = document.createElement("option");
        option.textContent = "Tidak ada dokter tersedia";
        option.disabled = true;
        selectElement.appendChild(option);
    }
}

function addPolyclinic(event) {
    event.preventDefault();
    const newPoliNameInput = document.getElementById("new-poli-name");
    if (!newPoliNameInput) return;

    const newPoliName = newPoliNameInput.value.toLowerCase().trim();
    if (!newPoliName) {
        showMessage("add-poli-message", "Nama poli tidak boleh kosong.", true);
        return;
    }

    if (schedules[newPoliName]) {
        showMessage("add-poli-message", `Poli '${newPoliName}' sudah ada.`, true);
    } else {
        schedules[newPoliName] = [];
        populatePoliDropdown("poli-select");
        populatePoliDropdown("admin-schedule-poli-select");
        updateScheduleOptions();
        showMessage("add-poli-message", `Poli '${newPoliName}' berhasil ditambahkan.`);
        newPoliNameInput.value = "";
    }
}

function addDoctor(event) {
    event.preventDefault();
    const usernameInput = document.getElementById("new-doctor-username");
    const passwordInput = document.getElementById("new-doctor-password");
    if (!usernameInput || !passwordInput) return;

    const username = usernameInput.value.toLowerCase().trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        showMessage("add-doctor-message", "Username dan password tidak boleh kosong.", true);
        return;
    }

    if (users.doctors[username]) {
        showMessage("add-doctor-message", `Dokter dengan username '${username}' sudah ada.`, true);
    } else {
        users.doctors[username] = { 
            username, 
            password, 
            role: "doctor",
            biodata: { 
                name: `Dr. ${username.charAt(0).toUpperCase() + username.slice(1)}`, 
                specialty: "Belum ditentukan", 
                phone: "Belum ditentukan", 
                email: `${username}@rsudelima.com` 
            }
        };
        populateDoctorDropdown();
        showMessage("add-doctor-message", `Dokter '${username}' berhasil ditambahkan.`);
        usernameInput.value = "";
        passwordInput.value = "";
    }
}

function adminAddDoctorSchedule(event) {
    event.preventDefault();
    const poliSelect = document.getElementById("admin-schedule-poli-select");
    const doctorSelect = document.getElementById("admin-schedule-doctor");
    const dateInput = document.getElementById("admin-schedule-date");
    const timeInput = document.getElementById("admin-schedule-time");
    const capacityInput = document.getElementById("admin-schedule-capacity");

    if (!poliSelect || !doctorSelect || !dateInput || !timeInput || !capacityInput) return;

    const poli = poliSelect.value;
    const doctor = doctorSelect.value.toLowerCase();
    const date = dateInput.value;
    const time = timeInput.value;
    const capacity = parseInt(capacityInput.value, 10);

    if (!poli || !doctor || !date || !time || isNaN(capacity) || capacity <= 0) {
        showMessage("admin-add-schedule-message", "Harap isi semua kolom dengan benar.", true);
        return;
    }

    if (!users.doctors[doctor]) {
        showMessage("admin-add-schedule-message", "Dokter tidak ditemukan.", true);
        return;
    }

    if (!schedules[poli]) schedules[poli] = [];

    const isDuplicate = schedules[poli].some(sched => 
        sched.date === date && sched.time === time && sched.doctor.toLowerCase() === doctor
    );

    if (isDuplicate) {
        showMessage("admin-add-schedule-message", "Jadwal dokter ini pada tanggal dan waktu tersebut sudah ada.", true);
        return;
    }

    schedules[poli].push({ date, time, doctor, capacity, patients: [], approved: [] });
    showMessage("admin-add-schedule-message", "Jadwal dokter berhasil ditambahkan!");
    updateDoctorSchedule();
    updateScheduleOptions();
    displayPatientDoctorSchedule();
    document.getElementById("admin-add-doctor-schedule-form").reset();
}

async function generateReportPDF(event) {
    event.preventDefault();
    if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
        showMessage("pdf-message", "Error: jsPDF library not loaded.", true);
        return;
    }
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const periodRadio = document.querySelector('input[name="recap-period"]:checked');
    if (!periodRadio) {
        showMessage("pdf-message", "Pilih periode laporan.", true);
        return;
    }

    const period = periodRadio.value;
    const now = new Date();
    let startDate, endDate;
    let reportTitle;

    if (period === "weekly") {
        reportTitle = "Rekap Laporan Mingguan";
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        startDate = new Date(now.setDate(diff));
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 0, 0, 0);
    } else {
        reportTitle = "Rekap Laporan Bulanan";
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 0, 0, 0);
    }

    const startDateFormat = startDate.toISOString().split('T')[0];
    const endDateFormat = endDate.toISOString().split('T')[0];

    let yPos = 10;
    doc.setFontSize(16);
    doc.text(reportTitle, 10, yPos);
    yPos += 10;
    doc.setFontSize(12);
    doc.text(`Periode: ${startDate.toLocaleDateString('id-ID')} - ${endDate.toLocaleDateString('id-ID')}`, 10, yPos);
    yPos += 10;

    let totalGlobalPatients = 0;
    let hasData = false;

    Object.keys(schedules).forEach(poli => {
        let totalPatientsForPoli = 0;
        let poliSchedules = [];
        schedules[poli].forEach(sched => {
            const scheduleDate = new Date(`${sched.date}T${sched.time}`);
            if (scheduleDate >= startDate && scheduleDate <= endDate) {
                totalPatientsForPoli += sched.patients.length;
                poliSchedules.push(sched);
            }
        });

        if (poliSchedules.length > 0) {
            hasData = true;
            if (yPos + 10 > doc.internal.pageSize.height - 20) {
                doc.addPage();
                yPos = 10;
            }
            doc.setFontSize(14);
            doc.text(`Poli ${poli.charAt(0).toUpperCase() + poli.slice(1)} (Total Pasien: ${totalPatientsForPoli})`, 10, yPos);
            yPos += 10;
            doc.setFontSize(10);
            poliSchedules.sort((a, b) => {
                const dateA = new Date(`${a.date}T${a.time}`);
                const dateB = new Date(`${b.date}T${b.time}`);
                return dateA - dateB;
            }).forEach(sched => {
                if (yPos + 15 > doc.internal.pageSize.height - 5) {
                    doc.addPage();
                    yPos = 10;
                    doc.setFontSize(14);
                    doc.text(`Poli ${poli.charAt(0).toUpperCase() + poli.slice(1)} (Lanjutan)`, 10, yPos);
                    yPos += 10;
                    doc.setFontSize(10);
                }
                doc.text(`${sched.date} ${sched.time}, Dokter: ${sched.doctor}, Pasien: ${sched.patients.length}/${sched.capacity}`, 15, yPos);
                yPos += 7;
                if (sched.patients.length > 0) {
                    sched.patients.forEach(patient => {
                        if (yPos + 5 > doc.internal.pageSize.height - 1) {
                            doc.addPage();
                            yPos = 10;
                            doc.setFontSize(10);
                        }
                        doc.text(`    Antrian ${patient.queue}: ${patient.name} (Status: ${patient.status})`, 20, yPos);
                        yPos += 5;
                    });
                }
            });
            yPos += 5;
            totalGlobalPatients += totalPatientsForPoli;
        }
    });

    if (!hasData) {
        doc.text("Tidak ada data laporan untuk periode yang dipilih.", 10, yPos);
    } else {
        if (yPos + 10 > doc.internal.pageSize.height - 10) {
            doc.addPage();
            yPos = 10;
        }
        doc.setFontSize(14);
        doc.text(`Total Keseluruhan Pasien: ${totalGlobalPatients}`, 10, yPos);
    }

    doc.save(`${reportTitle.toLowerCase().replace(/ /g, '_')}_${startDateFormat}_${endDateFormat}.pdf`);
    showMessage("pdf-message", "Laporan PDF berhasil dibuat!");
}

document.addEventListener("DOMContentLoaded", () => {
    updateOperationalStatus();
    setInterval(updateOperationalStatus, 60000);

    const startNowButton = document.getElementById("start-now");
    if (startNowButton) {
        startNowButton.addEventListener("click", (e) => {
            e.preventDefault();
            document.querySelector(".splash-screen").style.display = "none";
            document.querySelector(".container").classList.remove("hidden");
            document.getElementById("login-section").classList.remove("hidden");
            navMenu?.classList.remove("active");
        });
    }

    const startLink = document.getElementById("start-link");
    if (startLink) {
        startLink.addEventListener("click", (e) => {
            e.preventDefault();
            document.querySelector(".splash-screen").style.display = "block";
            document.querySelector(".container").classList.add("hidden");
            document.querySelectorAll(".card").forEach(card => card.classList.add("hidden"));
            navMenu?.classList.remove("active");
        });
    }

    const loginForm = document.getElementById("login-form");
    if (loginForm) loginForm.addEventListener("submit", login);

    const patientInfoForm = document.getElementById("patient-info-form");
    if (patientInfoForm) patientInfoForm.addEventListener("submit", savePatientInfo);

    const registrationForm = document.getElementById("registration-form");
    if (registrationForm) registrationForm.addEventListener("submit", registerPatient);

    const poliSelectPatient = document.getElementById("poli-select");
    if (poliSelectPatient) poliSelectPatient.addEventListener("change", updateScheduleOptions);

    const addPoliForm = document.getElementById("add-poli-form");
    if (addPoliForm) addPoliForm.addEventListener("submit", addPolyclinic);

    const addDoctorForm = document.getElementById("add-doctor-form");
    if (addDoctorForm) addDoctorForm.addEventListener("submit", addDoctor);

    const adminAddDoctorScheduleForm = document.getElementById("admin-add-doctor-schedule-form");
    if (adminAddDoctorScheduleForm) adminAddDoctorScheduleForm.addEventListener("submit", adminAddDoctorSchedule);

    const generatePdfForm = document.getElementById("generate-pdf-form");
    if (generatePdfForm) generatePdfForm.addEventListener("submit", generateReportPDF);

    document.querySelectorAll(".nav-menu a:not(#start-link)").forEach(link => {
        link.addEventListener("click", (e) => e.preventDefault());
    });

    document.getElementById("logout-patient")?.addEventListener("click", logout);
    document.getElementById("logout-doctor")?.addEventListener("click", logout);
    document.getElementById("logout-admin")?.addEventListener("click", logout);

    populatePoliDropdown("poli-select");
    updateScheduleOptions();
    updateDoctorSchedule();
    displayPatientDoctorSchedule();
    populatePoliDropdown("admin-schedule-poli-select");
    populateDoctorDropdown();
});
