let orders = [];
let filteredOrders = [];
let statusFlow = ["Masuk", "Diambil", "Dicuci", "Disetrika", "Dikirim"];
let pendingDeleteIndex = null;

// Harga dasar per layanan dan varian
const priceMatrix = {
    "Cuci Baju": { "Reguler": 3000, "Express": 5000, "Super Express": 8000, "Kilat": 10000 },
    "Cuci Karpet": { "Reguler": 5000, "Express": 8000, "Super Express": 12000, "Kilat": 15000 },
    "Cuci Sepatu": { "Reguler": 4000, "Express": 6000, "Super Express": 9000, "Kilat": 12000 },
    "Laundry Kiloan": { "Reguler": 2500, "Express": 4000, "Super Express": 6000, "Kilat": 8000 },
    "Dry Cleaning": { "Reguler": 8000, "Express": 12000, "Super Express": 18000, "Kilat": 22000 }
};

// Load data dummy
function loadDummyData() {
    orders = [
        {
            id: "ORD-RVPT9",
            pelanggan: "Karimah",
            layanan: "Cuci Baju",
            varian: "Reguler",
            qty: 5,
            total: 15000,
            status: "Dikirim"
        }
    ];
    filteredOrders = [...orders];
}

// Panggil dummy data
loadDummyData();

function renderTable() {
    const tbody = document.getElementById("orderTable");
    const emptyState = document.getElementById("emptyState");
    const tableHeader = document.querySelector(".table-header h2");
    
    tbody.innerHTML = "";

    if (filteredOrders.length === 0) {
        // Tampilkan empty state
        emptyState.style.display = "block";
        
        // Update pesan empty state berdasarkan pencarian
        const searchTerm = document.getElementById("searchInput").value.trim();
        const filterStatus = document.getElementById("filterStatus").value;
        
        if (searchTerm !== "" || filterStatus !== "Semua") {
            document.getElementById("emptyTitle").innerHTML = '<i class="fas fa-search"></i> Tidak ditemukan';
            document.getElementById("emptyMessage").innerHTML = `Tidak ada pesanan yang cocok dengan pencarian "${searchTerm}" ${filterStatus !== "Semua" ? `dan status "${filterStatus}"` : ''}.`;
        } else {
            document.getElementById("emptyTitle").innerHTML = '<i class="fas fa-inbox"></i> Tidak ada pesanan';
            document.getElementById("emptyMessage").innerHTML = 'Belum ada data pesanan. Klik tombol "+ Pesanan" untuk menambah.';
        }
        
        // Update judul tabel
        tableHeader.innerHTML = '<i class="fas fa-list"></i> Daftar Pesanan (0)';
    } else {
        // Sembunyikan empty state
        emptyState.style.display = "none";
        
        // Update judul tabel dengan jumlah data
        tableHeader.innerHTML = `<i class="fas fa-list"></i> Daftar Pesanan (${filteredOrders.length})`;
        
        filteredOrders.forEach((o, i) => {
            // Cari index asli di orders array
            const originalIndex = orders.findIndex(order => order.id === o.id);
            
            tbody.innerHTML += `
            <tr>
                <td><strong>${o.id}</strong></td>
                <td>${o.pelanggan}</td>
                <td>${o.layanan}</td>
                <td>${o.varian}</td>
                <td>${o.qty}</td>
                <td>Rp ${Number(o.total).toLocaleString()}</td>
                <td><span class="badge ${o.status}">${o.status}</span></td>
                <td>
                    <button class="btn btn-secondary" onclick="editOrder('${o.id}')" title="Edit pesanan">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-primary" onclick="nextStatus('${o.id}')" title="Ubah status">
                        <i class="fas fa-arrow-right"></i>
                    </button>
                    <button class="btn btn-danger" onclick="showDeleteConfirm('${o.id}')" title="Hapus pesanan">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>`;
        });
    }

    updateSummary();
}

function openModal(edit = false) {
    document.getElementById("orderModal").style.display = "flex";
    if (!edit) {
        document.getElementById("modalTitle").innerHTML = '<i class="fas fa-plus-circle"></i> Tambah Pesanan Baru';
        document.getElementById("orderForm").reset();
        document.getElementById("editIndex").value = "";
        document.getElementById("hargaSatuan").value = 5000;
        updateTotal();
    }
}

function closeModal() {
    document.getElementById("orderModal").style.display = "none";
    // Reset error messages
    document.querySelectorAll('.error-message').forEach(el => el.innerHTML = '');
    document.querySelectorAll('.form-group input, .form-group select').forEach(el => {
        el.classList.remove('error');
    });
}

function editOrder(orderId) {
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return;
    
    let o = orders[index];
    openModal(true);
    document.getElementById("modalTitle").innerHTML = '<i class="fas fa-edit"></i> Edit Pesanan';
    document.getElementById("editIndex").value = index;
    document.getElementById("pelanggan").value = o.pelanggan;
    document.getElementById("layanan").value = o.layanan;
    document.getElementById("varian").value = o.varian;
    document.getElementById("qty").value = o.qty;
    
    // Set harga satuan berdasarkan layanan dan varian
    if (priceMatrix[o.layanan] && priceMatrix[o.layanan][o.varian]) {
        document.getElementById("hargaSatuan").value = priceMatrix[o.layanan][o.varian];
    }
    
    document.getElementById("total").value = o.total;
    document.getElementById("totalDisplay").innerText = `Rp ${Number(o.total).toLocaleString()}`;
}

function showDeleteConfirm(orderId) {
    pendingDeleteIndex = orders.findIndex(o => o.id === orderId);
    document.getElementById("deleteConfirmModal").style.display = "flex";
}

function closeDeleteModal() {
    document.getElementById("deleteConfirmModal").style.display = "none";
    pendingDeleteIndex = null;
}

function deleteOrder() {
    if (pendingDeleteIndex !== null) {
        const deletedOrder = orders[pendingDeleteIndex];
        orders.splice(pendingDeleteIndex, 1);
        applyFilters();
        closeDeleteModal();
        showToast(`Pesanan ${deletedOrder.id} berhasil dihapus`, "success");
    }
}

// Validasi form
function validateForm() {
    let isValid = true;
    
    // Reset errors
    document.querySelectorAll('.error-message').forEach(el => el.innerHTML = '');
    document.querySelectorAll('.form-group input, .form-group select').forEach(el => {
        el.classList.remove('error');
    });
    
    // Validasi pelanggan
    const pelanggan = document.getElementById("pelanggan").value.trim();
    if (!pelanggan) {
        document.getElementById("errorPelanggan").innerHTML = "Nama pelanggan harus diisi";
        document.getElementById("pelanggan").classList.add('error');
        isValid = false;
    } else if (pelanggan.length < 3) {
        document.getElementById("errorPelanggan").innerHTML = "Nama pelanggan minimal 3 karakter";
        document.getElementById("pelanggan").classList.add('error');
        isValid = false;
    }
    
    // Validasi layanan
    const layanan = document.getElementById("layanan").value;
    if (!layanan) {
        document.getElementById("errorLayanan").innerHTML = "Layanan harus dipilih";
        document.getElementById("layanan").classList.add('error');
        isValid = false;
    }
    
    // Validasi varian
    const varian = document.getElementById("varian").value;
    if (!varian) {
        document.getElementById("errorVarian").innerHTML = "Varian harus dipilih";
        document.getElementById("varian").classList.add('error');
        isValid = false;
    }
    
    // Validasi qty
    const qty = parseInt(document.getElementById("qty").value);
    if (!qty || qty < 1) {
        document.getElementById("errorQty").innerHTML = "Qty minimal 1";
        document.getElementById("qty").classList.add('error');
        isValid = false;
    } else if (qty > 999) {
        document.getElementById("errorQty").innerHTML = "Qty maksimal 999";
        document.getElementById("qty").classList.add('error');
        isValid = false;
    }
    
    return isValid;
}

// Update total berdasarkan qty dan harga satuan
function updateTotal() {
    const qty = parseInt(document.getElementById("qty").value) || 0;
    const hargaSatuan = parseInt(document.getElementById("hargaSatuan").value) || 0;
    const total = qty * hargaSatuan;
    
    document.getElementById("total").value = total;
    document.getElementById("totalDisplay").innerText = `Rp ${total.toLocaleString()}`;
}

// Update harga satuan berdasarkan layanan dan varian
function updateHargaSatuan() {
    const layanan = document.getElementById("layanan").value;
    const varian = document.getElementById("varian").value;
    
    if (layanan && varian && priceMatrix[layanan] && priceMatrix[layanan][varian]) {
        document.getElementById("hargaSatuan").value = priceMatrix[layanan][varian];
    } else {
        document.getElementById("hargaSatuan").value = 0;
    }
    
    updateTotal();
}

// Show toast notification
function showToast(message, type = "success") {
    const toast = document.createElement('div');
    toast.className = `toast ${type === 'error' ? 'error' : ''}`;
    toast.innerHTML = `
        <i class="fas ${type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle'}"></i>
        ${message}
    `;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Apply filters (search and status)
function applyFilters() {
    const searchTerm = document.getElementById("searchInput").value.trim().toLowerCase();
    const filterStatus = document.getElementById("filterStatus").value;
    
    filteredOrders = orders.filter(order => {
        // Filter by status
        if (filterStatus !== "Semua" && order.status !== filterStatus) {
            return false;
        }
        
        // Filter by search term
        if (searchTerm !== "") {
            return (
                order.pelanggan.toLowerCase().includes(searchTerm) ||
                order.id.toLowerCase().includes(searchTerm) ||
                order.layanan.toLowerCase().includes(searchTerm) ||
                order.varian.toLowerCase().includes(searchTerm) ||
                order.total.toString().includes(searchTerm)
            );
        }
        
        return true;
    });
    
    // Show/hide clear button
    const clearBtn = document.querySelector('.btn-clear');
    if (searchTerm !== "") {
        clearBtn.style.display = "block";
    } else {
        clearBtn.style.display = "none";
    }
    
    renderTable();
    
    // Show search result message
    if (searchTerm !== "" && filteredOrders.length === 0) {
        showToast(`Pencarian "${searchTerm}" tidak ditemukan`, "error");
    }
}

// Clear search
function clearSearch() {
    document.getElementById("searchInput").value = "";
    applyFilters();
}

document.getElementById("orderForm").addEventListener("submit", function(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        showToast("Mohon lengkapi form dengan benar", "error");
        return;
    }

    let index = document.getElementById("editIndex").value;
    const qty = parseInt(document.getElementById("qty").value);
    const hargaSatuan = parseInt(document.getElementById("hargaSatuan").value);
    const total = qty * hargaSatuan;

    let data = {
        id: index === "" ? "ORD-" + Math.random().toString(36).substr(2, 5).toUpperCase() : orders[index].id,
        pelanggan: document.getElementById("pelanggan").value.trim(),
        layanan: document.getElementById("layanan").value,
        varian: document.getElementById("varian").value,
        qty: qty,
        total: total,
        status: index === "" ? "Masuk" : orders[index].status
    };

    if (index === "") {
        orders.push(data);
        showToast("Pesanan berhasil ditambahkan");
    } else {
        orders[index] = data;
        showToast("Pesanan berhasil diupdate");
    }

    applyFilters();
    closeModal();
});

document.getElementById("confirmDeleteBtn").addEventListener("click", deleteOrder);

// Event listeners untuk update harga
document.getElementById("layanan").addEventListener("change", updateHargaSatuan);
document.getElementById("varian").addEventListener("change", updateHargaSatuan);
document.getElementById("qty").addEventListener("input", updateTotal);

// Event listeners untuk search dan filter
document.getElementById("searchInput").addEventListener("input", function(e) {
    applyFilters();
});

document.getElementById("filterStatus").addEventListener("change", function(e) {
    applyFilters();
});

document.getElementById("clearSearch").addEventListener("click", clearSearch);

// Handle enter key on search
document.getElementById("searchInput").addEventListener("keypress", function(e) {
    if (e.key === "Enter") {
        applyFilters();
    }
});

function nextStatus(orderId) {
    const index = orders.findIndex(o => o.id === orderId);
    if (index === -1) return;
    
    let idx = statusFlow.indexOf(orders[index].status);
    if (idx < statusFlow.length - 1) {
        orders[index].status = statusFlow[idx + 1];
        applyFilters();
        showToast(`Status pesanan ${orders[index].id} diubah menjadi ${orders[index].status}`);
    }
}

function updateSummary() {
    document.getElementById("countMasuk").innerText = orders.filter(o => o.status === "Masuk").length;
    document.getElementById("countDiambil").innerText = orders.filter(o => o.status === "Diambil").length;
    document.getElementById("countDiproses").innerText = orders.filter(o => o.status === "Dicuci" || o.status === "Disetrika").length;
    document.getElementById("countDikirim").innerText = orders.filter(o => o.status === "Dikirim").length;
}

// Inisialisasi
applyFilters();