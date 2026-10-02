import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Target Components
import { Header } from '../components/common/Header';
import { Footer } from '../components/common/Footer';
import { LoginPage } from '../pages/AuthPages';
import { CustomerAccount } from '../pages/CustomerAccount';
import { AdminLayout } from '../layouts/AdminLayout';
import { INITIAL_SETTINGS } from '../services/mockData';
import { isAuthorizedAdminRole } from '../utils/authSecurity';

// Mocks
const mockLogout = vi.fn();
let mockCurrentUser: any = null;
let mockIsAdmin = false;

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockCurrentUser,
    isAdmin: mockIsAdmin,
    isLoading: false,
    logout: mockLogout,
    login: vi.fn(),
  }),
}));

vi.mock('../context/CartContext', () => ({
  useCart: () => ({
    itemCount: 2,
    setIsCartOpen: vi.fn(),
  }),
}));

vi.mock('../context/WishlistContext', () => ({
  useWishlist: () => ({
    wishlistCount: 1,
  }),
}));

vi.mock('../context/SettingsContext', () => ({
  useSettings: () => ({
    settings: INITIAL_SETTINGS,
    isLoading: false,
  }),
}));

vi.mock('../services/ordersService', () => ({
  ordersService: {
    getOrders: vi.fn().mockResolvedValue([
      {
        id: 'ord_123',
        order_number: 'PFS-8921',
        total_amount: 2499,
        order_status: 'processing',
        payment_status: 'paid',
        payment_method: 'upi',
        customer_name: 'Ananya Sharma',
        customer_email: 'customer@pocketfriendlysarees.com',
        customer_phone: '9876543210',
        shipping_address: {
          id: 'addr_1',
          full_name: 'Ananya Sharma',
          phone: '9876543210',
          address_line1: '123 MG Road',
          city: 'Bangalore',
          state: 'Karnataka',
          pincode: '560001',
          country: 'India',
        },
        subtotal: 2499,
        discount_total: 0,
        shipping_fee: 0,
        tax_total: 0,
        created_at: '2026-10-01T12:00:00Z',
        items: [],
      },
    ]),
  },
}));

describe('Storefront & Admin Isolation Verification (TEST SCENARIOS 1 - 10)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCurrentUser = null;
    mockIsAdmin = false;
  });

  it('TEST 1 & 2: Header contains NO admin links or references for guests', () => {
    render(
      <MemoryRouter>
        <Header onOpenSearch={vi.fn()} />
      </MemoryRouter>
    );

    // Assert all links in the header
    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      const href = link.getAttribute('href');
      expect(href).not.toMatch(/\/admin/i);
    });

    // Verify account menu toggle
    const accountBtn = screen.getByLabelText('Account Menu');
    fireEvent.click(accountBtn);

    expect(screen.getByText('Sign In')).toBeDefined();
    expect(screen.getByText('Create Account')).toBeDefined();
    expect(screen.queryByText(/admin/i)).toBeNull();
    expect(screen.queryByText(/staff/i)).toBeNull();
  });

  it('TEST 2 & 8: Header contains NO admin links or badges for logged-in customers', () => {
    mockCurrentUser = {
      id: 'cust-1',
      email: 'customer@pocketfriendlysarees.com',
      full_name: 'Ananya Sharma',
      role: 'customer',
    };
    mockIsAdmin = false;

    render(
      <MemoryRouter>
        <Header onOpenSearch={vi.fn()} />
      </MemoryRouter>
    );

    const accountBtn = screen.getByLabelText('Account Menu');
    fireEvent.click(accountBtn);

    expect(screen.getByText('My Profile')).toBeDefined();
    expect(screen.getByText('My Orders')).toBeDefined();
    expect(screen.getByText('My Wishlist')).toBeDefined();
    expect(screen.getByText('Sign Out')).toBeDefined();

    // Verify absolutely no admin controls
    expect(screen.queryByText(/admin dashboard/i)).toBeNull();
    expect(screen.queryByText(/admin role/i)).toBeNull();
    expect(screen.queryByText(/admin portal/i)).toBeNull();
  });

  it('TEST 3: Mobile drawer navigation contains NO admin links', () => {
    render(
      <MemoryRouter>
        <Header onOpenSearch={vi.fn()} />
      </MemoryRouter>
    );

    const toggleBtn = screen.getByLabelText('Toggle Navigation Menu');
    fireEvent.click(toggleBtn);

    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      const href = link.getAttribute('href');
      expect(href).not.toMatch(/\/admin/i);
    });

    expect(screen.queryByText(/admin dashboard/i)).toBeNull();
    expect(screen.queryByText(/staff portal/i)).toBeNull();
  });

  it('TEST 4: Footer contains NO admin links or Staff Portal links', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>
    );

    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      const href = link.getAttribute('href');
      expect(href).not.toMatch(/\/admin/i);
    });

    expect(screen.queryByText(/staff portal/i)).toBeNull();
    expect(screen.queryByText(/admin/i)).toBeNull();
  });

  it('TEST 5: Customer Login Page contains NO admin portal links or store manager hints', () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    const links = screen.getAllByRole('link');
    links.forEach((link) => {
      const href = link.getAttribute('href');
      expect(href).not.toMatch(/\/admin/i);
    });

    expect(screen.queryByText(/admin portal/i)).toBeNull();
    expect(screen.queryByText(/store manager/i)).toBeNull();
    expect(screen.getByText('Welcome Back')).toBeDefined();
    expect(screen.getByText('Sign in to your PocketFriendly Sarees account.')).toBeDefined();
  });

  it('TEST 6: Customer Account page contains NO Admin Dashboard buttons', async () => {
    mockCurrentUser = {
      id: 'cust-1',
      email: 'customer@pocketfriendlysarees.com',
      full_name: 'Ananya Sharma',
      role: 'customer',
    };
    mockIsAdmin = false;

    render(
      <MemoryRouter>
        <CustomerAccount />
      </MemoryRouter>
    );

    expect(await screen.findByText('Welcome back, Ananya Sharma!')).toBeDefined();
    expect(screen.queryByText(/admin dashboard/i)).toBeNull();
    expect(screen.queryByText(/staff/i)).toBeNull();
  });

  it('TEST 7: Customer Order History shows customer orders with no admin controls', async () => {
    mockCurrentUser = {
      id: 'cust-1',
      email: 'customer@pocketfriendlysarees.com',
      full_name: 'Ananya Sharma',
      role: 'customer',
    };
    mockIsAdmin = false;

    render(
      <MemoryRouter>
        <CustomerAccount />
      </MemoryRouter>
    );

    expect(await screen.findByText('PFS-8921')).toBeDefined();
    expect(screen.queryByText(/edit order/i)).toBeNull();
    expect(screen.queryByText(/override/i)).toBeNull();
  });

  it('TEST 8: Customer role authorization evaluates strictly to false', () => {
    const customerRole = 'customer';
    expect(isAuthorizedAdminRole(customerRole)).toBe(false);
  });

  it('TEST 9: Customer navigating directly to /admin is presented with ACCESS DENIED', () => {
    mockCurrentUser = {
      id: 'cust-1',
      email: 'customer@pocketfriendlysarees.com',
      role: 'customer',
    };
    mockIsAdmin = false;

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<div>Admin Secret Dashboard</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Access Denied')).toBeDefined();
    expect(screen.getByText(/does not have administrator privileges/i)).toBeDefined();
    expect(screen.queryByText('Admin Secret Dashboard')).toBeNull();
    expect(screen.getByText('Sign Out & Switch Account')).toBeDefined();
    expect(screen.getByText('← Return to Storefront')).toBeDefined();
  });

  it('TEST 10: Authorized admin navigating to /admin is GRANTED access', () => {
    mockCurrentUser = {
      id: 'admin-1',
      email: 'admin@pocketfriendlysarees.com',
      role: 'admin',
    };
    mockIsAdmin = true;

    render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<div>Admin Secret Dashboard Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.queryByText('Access Denied')).toBeNull();
    expect(screen.getByText('Admin Secret Dashboard Content')).toBeDefined();
    expect(screen.getByText('PocketFriendly Sarees • Administration')).toBeDefined();
    expect(screen.getByText('Live Store Engine')).toBeDefined();
  });
});
