"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Account = {
  id: number;
  name: string;
  type: string;
  openingBalance: number;
  currentBalance: number;
  active: boolean;
};

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [type, setType] = useState("Bank");
  const [openingBalance, setOpeningBalance] = useState("");
  const [saving, setSaving] = useState(false);

  async function loadAccounts() {
    try {
      const response = await fetch("/api/accounts");
      const data = await response.json();

      if (response.ok) {
        setAccounts(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAccounts();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!name.trim()) {
      alert("Account name is required");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/accounts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          type,
          openingBalance: Number(openingBalance || 0),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Something went wrong");
        return;
      }

      setAccounts((current) => [...current, data]);

      setName("");
      setType("Bank");
      setOpeningBalance("");
    } catch (error) {
      console.error(error);
      alert("Failed to create account");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = confirm(
      "Are you sure you want to deactivate this account?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/accounts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        alert("Failed to deactivate account");
        return;
      }

      setAccounts((current) =>
        current.filter((account) => account.id !== id)
      );
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  }

  const totalBalance = accounts.reduce(
    (total, account) => total + account.currentBalance,
    0
  );

  const totalOpeningBalance = accounts.reduce(
    (total, account) => total + account.openingBalance,
    0
  );

  return (
    <main className="app-shell">

      {/* SIDEBAR */}

      <aside className="sidebar">

        <Link href="/" className="brand">
          <div className="brand-icon">
            M
          </div>

          <div>
            <strong>MoneyTrack</strong>
            <span>Personal Finance</span>
          </div>
        </Link>

        <nav className="sidebar-nav">

          <span className="nav-label">
            MAIN MENU
          </span>

          <Link href="/" className="nav-item">
            <span>⌂</span>
            Dashboard
          </Link>

          <Link
            href="/accounts"
            className="nav-item active"
          >
            <span>▣</span>
            Accounts
          </Link>

          <Link
            href="/transactions"
            className="nav-item"
          >
            <span>↕</span>
            Transactions
          </Link>

          <Link
            href="/people"
            className="nav-item"
          >
            <span>♙</span>
            People
          </Link>

          <Link
            href="/debts"
            className="nav-item"
          >
            <span>৳</span>
            পাওনা / দেনা
          </Link>

          <span className="nav-label second-label">
            MANAGE
          </span>

          <Link
            href="/reports"
            className="nav-item"
          >
            <span>◫</span>
            Reports
          </Link>

          <Link
            href="/settings"
            className="nav-item"
          >
            <span>⚙</span>
            Settings
          </Link>

        </nav>

        <div className="sidebar-bottom">

          <div className="security-card">

            <div className="security-icon">
              ✓
            </div>

            <div>
              <strong>
                Your money, organized.
              </strong>

              <span>
                Track every taka with confidence.
              </span>
            </div>

          </div>

        </div>

      </aside>


      {/* MAIN CONTENT */}

      <section className="main-content">

        {/* HEADER */}

        <header className="dashboard-header">

          <div>

            <p className="eyebrow">
              MONEY ACCOUNTS
            </p>

            <h1>
              Accounts
            </h1>

            <p className="header-subtitle">
              Manage your bank, cash and digital accounts.
            </p>

          </div>

          <Link
            href="/"
            className="add-transaction-button"
          >
            ← Dashboard
          </Link>

        </header>


        {/* ACCOUNT SUMMARY */}

        <section className="account-premium-summary">

          <div className="account-summary-card main">

            <div className="account-summary-icon">
              ৳
            </div>

            <div>
              <span>
                TOTAL BALANCE
              </span>

              <strong>
                ৳ {totalBalance.toLocaleString()}
              </strong>

              <small>
                Across all active accounts
              </small>
            </div>

          </div>


          <div className="account-summary-card">

            <div className="account-summary-icon light">
              ▣
            </div>

            <div>
              <span>
                ACTIVE ACCOUNTS
              </span>

              <strong>
                {accounts.length}
              </strong>

              <small>
                Bank, cash & digital wallets
              </small>
            </div>

          </div>


          <div className="account-summary-card">

            <div className="account-summary-icon light">
              +
            </div>

            <div>
              <span>
                OPENING BALANCE
              </span>

              <strong>
                ৳ {totalOpeningBalance.toLocaleString()}
              </strong>

              <small>
                Total starting balance
              </small>
            </div>

          </div>

        </section>


        {/* ADD ACCOUNT */}

        <section className="account-premium-form">

          <div className="account-form-header">

            <div>

              <span className="form-eyebrow">
                NEW ACCOUNT
              </span>

              <h2>
                Add Account
              </h2>

              <p>
                Add a bank, cash or digital wallet.
              </p>

            </div>

            <div className="account-form-mark">
              +
            </div>

          </div>


          <form onSubmit={handleSubmit}>

            <div className="account-form-grid">

              <div>

                <label>
                  Account Name
                </label>

                <input
                  type="text"
                  placeholder="e.g. Bank Asia"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                />

              </div>


              <div>

                <label>
                  Account Type
                </label>

                <select
                  value={type}
                  onChange={(event) =>
                    setType(event.target.value)
                  }
                >

                  <option value="Bank">
                    Bank
                  </option>

                  <option value="Cash">
                    Cash
                  </option>

                  <option value="Mobile Banking">
                    Mobile Banking
                  </option>

                  <option value="Business">
                    Business
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>


              <div>

                <label>
                  Opening Balance
                </label>

                <div className="account-input-wrapper">

                  <span>
                    ৳
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={openingBalance}
                    onChange={(event) =>
                      setOpeningBalance(
                        event.target.value
                      )
                    }
                  />

                </div>

              </div>

            </div>


            <button
              type="submit"
              className="account-save-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "+ Add Account"}
            </button>

          </form>

        </section>


        {/* ACCOUNT LIST */}

        <section className="account-premium-list">

          <div className="account-list-header">

            <div>

              <span className="form-eyebrow">
                YOUR MONEY
              </span>

              <h2>
                My Accounts
              </h2>

              <p>
                All your active accounts and balances.
              </p>

            </div>

            <span className="account-count">
              {accounts.length} Accounts
            </span>

          </div>


          {loading ? (

            <div className="account-loading">
              <div className="loading-circle" />
              Loading accounts...
            </div>

          ) : accounts.length === 0 ? (

            <div className="account-empty">

              <div className="account-empty-icon">
                ▣
              </div>

              <h3>
                No accounts yet
              </h3>

              <p>
                Add your first bank, cash or mobile
                banking account above.
              </p>

            </div>

          ) : (

            <div className="premium-account-list">

              {accounts.map((account) => (

                <div
                  className="premium-account-row"
                  key={account.id}
                >

                  <div className="premium-account-icon">
                    ৳
                  </div>


                  <div className="premium-account-info">

                    <strong>
                      {account.name}
                    </strong>

                    <span>
                      {account.type}
                    </span>

                  </div>


                  <div className="premium-account-balance">

                    <span>
                      Current Balance
                    </span>

                    <strong>
                      ৳{" "}
                      {account.currentBalance.toLocaleString()}
                    </strong>

                  </div>


                  <div className="premium-account-opening">

                    <span>
                      Opening
                    </span>

                    <strong>
                      ৳{" "}
                      {account.openingBalance.toLocaleString()}
                    </strong>

                  </div>


                  <button
                    type="button"
                    className="deactivate-account"
                    onClick={() =>
                      handleDelete(account.id)
                    }
                  >
                    Deactivate
                  </button>

                </div>

              ))}

            </div>

          )}

        </section>

      </section>

    </main>
  );
}