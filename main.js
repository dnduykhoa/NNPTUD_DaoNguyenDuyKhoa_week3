// API URL
const API_URL = 'https://api.escuelajs.co/api/v1/products';

// Biến lưu trữ toàn bộ sản phẩm
let allProducts = [];
let filteredProducts = []; // Sản phẩm sau khi lọc
let currentPage = 1;
let itemsPerPage = 10;
let currentSort = { field: null, order: null }; // null, 'asc', 'desc'

// Hàm getAll để lấy tất cả sản phẩm
async function getAll() {
    try {
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const products = await response.json();
        allProducts = products; // Lưu trữ toàn bộ sản phẩm
        displayProducts(products);
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        document.getElementById('loading').textContent = 'Lỗi khi tải dữ liệu. Vui lòng thử lại sau.';
    }
}

// Hàm hiển thị sản phẩm lên bảng
function displayProducts(products) {
    const productBody = document.getElementById('productBody');
    const loadingDiv = document.getElementById('loading');
    const table = document.getElementById('productTable');
    const searchBox = document.getElementById('searchBox');
    const paginationContainer = document.getElementById('paginationContainer');
    
    // Lưu sản phẩm đã lọc
    filteredProducts = products;
    
    // Xóa loading và hiển thị search box
    loadingDiv.style.display = 'none';
    table.style.display = 'table';
    searchBox.style.display = 'block';
    paginationContainer.style.display = 'flex';
    
    // Tính toán phân trang
    const totalPages = Math.ceil(products.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedProducts = products.slice(startIndex, endIndex);
    
    // Xóa nội dung cũ
    productBody.innerHTML = '';
    
    // Thêm từng sản phẩm vào bảng (chỉ hiển thị sản phẩm của trang hiện tại)
    paginatedProducts.forEach(product => {
        const row = document.createElement('tr');
        
        // Thử nhiều nguồn hình ảnh - Ưu tiên product.images[0]
        let imageUrl = 'https://placehold.co/100x100/333/FFF?text=No+Image';
        
        if (product.images && product.images.length > 0) {
            imageUrl = product.images[0];
            // Xóa ký tự đặc biệt nếu có
            if (typeof imageUrl === 'string') {
                imageUrl = imageUrl.replace(/[\[\]"']/g, '').trim();
            }
        } else if (product.category && product.category.image) {
            imageUrl = product.category.image;
        }
        
        row.innerHTML = `
            <td>${product.id}</td>
            <td><img src="${imageUrl}" alt="${product.title}" class="product-image" referrerpolicy="no-referrer" onerror="this.onerror=null; this.src='https://placehold.co/100x100/333/FFF?text=${product.id}';"></td>
            <td>${product.title}</td>
            <td class="price">$${product.price}</td>
            <td>${product.category ? product.category.name : 'N/A'}</td>
        `;
        
        // Lưu description vào data attribute
        row.setAttribute('data-description', product.description);
        
        // Thêm event hover để hiển thị tooltip
        row.addEventListener('mouseenter', showTooltip);
        row.addEventListener('mouseleave', hideTooltip);
        row.addEventListener('mousemove', moveTooltip);
        
        productBody.appendChild(row);
    });
    
    // Cập nhật phân trang
    updatePagination();
}

// Hàm hiển thị tooltip
function showTooltip(event) {
    const tooltip = document.getElementById('descriptionTooltip');
    const description = event.currentTarget.getAttribute('data-description');
    
    tooltip.textContent = description;
    tooltip.classList.add('show');
    
    // Vị trí ban đầu
    moveTooltip(event);
}

// Hàm ẩn tooltip
function hideTooltip() {
    const tooltip = document.getElementById('descriptionTooltip');
    tooltip.classList.remove('show');
}

// Hàm di chuyển tooltip theo con trỏ chuột
function moveTooltip(event) {
    const tooltip = document.getElementById('descriptionTooltip');
    const offset = 15;
    
    let x = event.clientX + offset;
    let y = event.clientY + offset;
    
    // Kiểm tra nếu tooltip vượt quá màn hình
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (x + tooltipRect.width > viewportWidth) {
        x = event.clientX - tooltipRect.width - offset;
    }
    
    if (y + tooltipRect.height > viewportHeight) {
        y = event.clientY - tooltipRect.height - offset;
    }
    
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
}

// Hàm cập nhật giao diện phân trang
function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const pageNumbers = document.getElementById('pageNumbers');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    
    // Reset current page nếu vượt quá tổng số trang
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }
    if (currentPage < 1) currentPage = 1;
    
    // Cập nhật nút Prev/Next
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    
    // Tạo các nút số trang
    pageNumbers.innerHTML = '';
    
    // Hiển thị tối đa 5 số trang
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    
    if (endPage - startPage < 4) {
        startPage = Math.max(1, endPage - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = 'page-number' + (i === currentPage ? ' active' : '');
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            displayProducts(filteredProducts);
        });
        pageNumbers.appendChild(pageBtn);
    }
    
    // Cập nhật thông tin trang
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, filteredProducts.length);
    pageInfo.textContent = `Hiển thị ${startItem}-${endItem} trong tổng số ${filteredProducts.length} sản phẩm`;
}

// Hàm tìm kiếm sản phẩm theo title
function searchProducts(searchTerm) {
    currentPage = 1; // Reset về trang 1 khi tìm kiếm
    const filtered = allProducts.filter(product => 
        product.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    displayProducts(filtered);
}

// Hàm sắp xếp sản phẩm
function sortProducts(field) {
    // Xác định thứ tự sắp xếp
    if (currentSort.field === field) {
        // Nếu đang sắp xếp cùng field, đổi thứ tự
        if (currentSort.order === 'asc') {
            currentSort.order = 'desc';
        } else if (currentSort.order === 'desc') {
            currentSort.order = null;
            currentSort.field = null;
        } else {
            currentSort.order = 'asc';
        }
    } else {
        // Nếu sắp xếp field mới, bắt đầu từ asc
        currentSort.field = field;
        currentSort.order = 'asc';
    }
    
    // Cập nhật UI
    updateSortUI();
    
    // Nếu không có sắp xếp, hiển thị lại danh sách gốc
    if (!currentSort.field || !currentSort.order) {
        displayProducts(filteredProducts);
        return;
    }
    
    // Sắp xếp mảng
    const sorted = [...filteredProducts].sort((a, b) => {
        let valueA = a[field];
        let valueB = b[field];
        
        // Xử lý cho trường hợp string (title)
        if (field === 'title') {
            valueA = valueA.toLowerCase();
            valueB = valueB.toLowerCase();
        }
        
        if (currentSort.order === 'asc') {
            return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
            return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
    });
    
    currentPage = 1; // Reset về trang 1
    displayProducts(sorted);
}

// Hàm cập nhật UI sắp xếp
function updateSortUI() {
    const sortableHeaders = document.querySelectorAll('th.sortable');
    sortableHeaders.forEach(header => {
        header.classList.remove('asc', 'desc');
        const field = header.getAttribute('data-sort');
        if (field === currentSort.field && currentSort.order) {
            header.classList.add(currentSort.order);
        }
    });
}

// Gọi hàm getAll khi trang được load
window.addEventListener('DOMContentLoaded', () => {
    getAll();
    
    // Gắn sự kiện onChange cho ô tìm kiếm
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', (e) => {
        searchProducts(e.target.value);
    });
    
    // Gắn sự kiện cho items per page
    const itemsPerPageSelect = document.getElementById('itemsPerPage');
    itemsPerPageSelect.addEventListener('change', (e) => {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 1; // Reset về trang 1
        displayProducts(filteredProducts);
    });
    
    // Gắn sự kiện cho nút Prev/Next
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayProducts(filteredProducts);
        }
    });
    
    document.getElementById('nextPage').addEventListener('click', () => {
        const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            displayProducts(filteredProducts);
        }
    });
    
    // Gắn sự kiện cho các cột có thể sắp xếp
    const sortableHeaders = document.querySelectorAll('th.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const field = header.getAttribute('data-sort');
            sortProducts(field);
        });
    });
});
