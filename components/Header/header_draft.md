<div :class="['header-container', { 'fixed-header': isHeaderFixed }]">
        <a-layout-header class="header">
            <div class="left-section">
                <img :src="logoUrl" alt="FPT Shop Logo" class="logo" />
                <div class="cate-btn-hover" @mouseenter="handleCategoryHover(true)"
                    @mouseleave="handleCategoryHover(false)">
                    <a-button class="category-button">
                        <MenuOutlined /> Danh mục
                    </a-button>

                    <!-- Dropdown menu hiển thị khi hover -->
                    <div :class="['dropdown-menu', { 'active': isCateHover }]">
                        <div class="menu-content">
                            <img src="https://as2.ftcdn.net/v2/jpg/03/93/52/43/1000_F_393524375_58iWZrcnROU7SV33zfk77pWNUIdAgTPb.jpg"
                                alt="Middle Finger Up Hand Gesture Flipping Off. Vector Illustrator. vector ..."
                                class=" nofocus" tabindex="0"
                                aria-label="Middle Finger Up Hand Gesture Flipping Off. Vector Illustrator. vector ..."
                                role="button">
                        </div>
                    </div>
                </div>
                <div class="search-container">
                    <div class="search-bar">
                        <input v-model="searchQuery" type="text"
                            placeholder="Nhập tên điện thoại, máy tính, phụ kiện... cần tìm" />
                        <button @click="onSearch" title="Tìm kiếm" class="search-btn">
                            <SearchOutlined class="search-icon" />
                        </button>
                    </div>
                    <div class="hot-keyword">
                        <a href="">iphone 16</a>
                        <a href="">laptop</a>
                        <a href="">apple watch</a>
                        <a href="">ipad</a>
                        <a href="">máy lạnh</a>
                        <a href="">robot hút bụi</a>
                        <a href="">samsung</a>
                        <a href="">carseat</a>
                    </div>
                </div>
            </div>

            <div class="right-section">
                <a-avatar class="avatar">
                    <UserOutlined class="avatar-icon" />
                </a-avatar>
                <a-badge count="0" class="cart-badge">
                    <a-button class="cart-button">
                        <ShoppingCartOutlined />
                        Giỏ hàng
                    </a-button>
                </a-badge>
            </div>
        </a-layout-header>
    </div>
    .header-container {
    position: relative;
    width: 100vw;
    right: 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: linear-gradient(5deg, #cb1c22 67.61%, #d9503f 95.18%);
    transition: all 0.3s ease;
}

.header-container.fixed-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
    from {
        transform: translateY(-100%);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
}

.header {
    min-width: 1300px;
    display: flex;
    align-items: start;
    justify-content: center;
    padding: 0px 30px 20px 35px;
}

.left-section {
    display: flex;
    max-width: 80%;
    justify-content: baseline;
    align-items: start;
    flex-grow: 1;
    padding: 20px 0 0 0;
}

.logo {
    height: 40px;
    margin-right: 20px;
}

.cate-btn-hover {
    position: relative;
    z-index: 1000;
}

.category-button {
    border-radius: 30px;
    min-height: fit-content;
    min-width: 140px;
    padding: 8px 0;
    margin: 0px 8px 0 40px;
    font-weight: 450;
    font-size: large;
    background: #7e161c;
    color: white;
    border: none;
}

.category-button:hover {
    background: #990000;
}

/* Dropdown menu styles */
.dropdown-menu {
    width: 1240px;
    height: 640px;
    position: absolute;
    opacity: 1;
    top: 52px;
    left: -210px;
    background: white;
    border-radius: 12px;
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 1001;
    display: flex;
    align-items: center;
    justify-content: center;
}

.dropdown-menu.active {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.menu-content {
    padding: 12px 0;
}

.search-container {
    display: flex;
    justify-content: flex-start;
    align-items: baseline;
    flex-direction: column;
    width: 100%;
}

.search-bar {
    display: flex;
    align-items: center;
    background-color: white;
    border-radius: 35px;
    padding: 6px 12px;
    min-width: 565px;
    margin: 0px 0px 0px 0px;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.05);
    flex-grow: 1;
}

.search-bar input {
    flex-grow: 1;
    border: none;
    outline: none;
    font-size: 14px;
    background: transparent;
}

.search-btn {
    background-color: #fee2e2;
    color: white;
    border: none;
    border-radius: 50%;
    width: 35px;
    height: 35px;
    margin-left: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
}

.search-icon {
    color: #7e161c;
}

.hot-keyword {
    display: flex;
    flex-direction: row;
    gap: 1px;
    margin: 5px 0px 0px 6px;
}

.hot-keyword a {
    text-decoration: none;
    font-family: "Inter", sans-serif;
    font-optical-sizing: auto;
    line-height: 22px;
    font-size: 15px;
    color: #fff;
    padding: 0 0 0 10px;
}

.hot-keyword a:hover {
    text-decoration: underline;
}

.right-section {
    padding: 20px 0 0 0;
    height: 60px;
    gap: 10px;
    display: flex;
    align-items: center;
}

.cart-badge {
    display: flex;
    align-items: center;
    height: fit-content;
}

.cart-button {
    width: 132.17px;
    height: 44px;
    font-size: 1rem;
    font-weight: 500;
    padding: 0px 18px 0px 18px;
    border-radius: 40px;
    background: #000;
    color: white;
    border: none;
}

.avatar {
    display: flex;
    align-items: center;
    width: 44px;
    height: 44px;
    background-color: #7d161c;
    margin-left: 0px;
}

.avatar-icon {
    font-size: 18px;
}