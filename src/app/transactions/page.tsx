"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Account = {
  id: number;
  name: string;
  type: string;
};

type Category = {
  id: number;
  name: string;
  type: string;
};

type Transaction = {
  id: number;
  type: string;
  amount: number;
  description: string | null;
  date: string;
  account: Account;
  category: Category | null;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [type, setType] = useState("INCOME");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    try {
      const [transactionResponse, accountResponse] =
        await Promise.all([
          fetch("/api/transactions"),
          fetch("/api/accounts"),
        ]);

      const transactionData = await transactionResponse.json();
      const accountData = await accountResponse.json();

      setTransactions(transactionData);
      setAccounts(accountData);

      // Category API এখনো তৈরি হয়নি
      setCategories([]);

      if (accountData.length > 0 && !accountId) {
        setAccountId(String(accountData[0].id));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!accountId) {
      alert("Please select an account");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          amount: Number(amount),
          description,
          accountId: Number(accountId),
          categoryId: categoryId
            ? Number(categoryId)
            : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Something went wrong");
        return;
      }

      setTransactions((current) => [
        data,
        ...current,
      ]);

      setAmount("");
      setDescription("");
      setCategoryId("");
    } catch (error) {
      console.error(error);
      alert("Failed to save transaction");
    } finally {
      setSaving(false);
    }
  }

  function getTypeLabel(transactionType: string) {
    switch (transactionType) {
      case "INCOME":
        return "Income";
      case "EXPENSE":
        return "Expense";
      case "RECEIVABLE":
        return "Receivable";
      case "PAYABLE":
        return "Payable";
      default:
        return transactionType;
    }
  }

  function getTypeIcon(transactionType: string) {
    switch (transactionType) {
      case "INCOME":
        return "↑";
      case "EXPENSE":
        return "↓";
      case "RECEIVABLE":
        return "↗";
      case "PAYABLE":
        return "↙";
      default:
        return "৳";
    }
  }

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

          <Link
            href="/"
            className="nav-item"
          >
            <span>⌂</span>
            Dashboard
          </Link>

          <Link
            href="/accounts"
            className="nav-item"
          >
            <span>▣</span>
            Accounts
          </Link>

          <Link
            href="/transactions"
            className="nav-item active"
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
              MONEY ACTIVITY
            </p>

            <h1>
              Transactions
            </h1>

            <p className="header-subtitle">
              Record and manage all your money activity.
            </p>

          </div>

          <Link
            href="/"
            className="add-transaction-button"
          >
            ← Dashboard
          </Link>

        </header>


        {/* ADD TRANSACTION */}

        <section className="transaction-form-card premium-form-card">

          <div className="transaction-form-heading">

            <div>

              <span className="form-eyebrow">
                MONEY ENTRY
              </span>

              <h2>
                Add Transaction
              </h2>

              <p>
                Record income, expenses and money owed.
              </p>

            </div>

            <div className="transaction-form-mark">
              ৳
            </div>

          </div>


          <form onSubmit={handleSubmit}>

            {/* TRANSACTION TYPE */}

            <div className="transaction-type premium-type-selector">

              <button
                type="button"
                className={
                  type === "INCOME"
                    ? "active income"
                    : ""
                }
                onClick={() => setType("INCOME")}
              >
                <span>↑</span>
                Income
              </button>

              <button
                type="button"
                className={
                  type === "EXPENSE"
                    ? "active expense"
                    : ""
                }
                onClick={() => setType("EXPENSE")}
              >
                <span>↓</span>
                Expense
              </button>

              <button
                type="button"
                className={
                  type === "RECEIVABLE"
                    ? "active receivable"
                    : ""
                }
                onClick={() =>
                  setType("RECEIVABLE")
                }
              >
                <span>↗</span>
                Receivable
              </button>

              <button
                type="button"
                className={
                  type === "PAYABLE"
                    ? "active payable"
                    : ""
                }
                onClick={() =>
                  setType("PAYABLE")
                }
              >
                <span>↙</span>
                Payable
              </button>

            </div>


            {/* FORM */}

            <div className="transaction-form-grid">

              <div>

                <label>
                  Amount
                </label>

                <div className="input-with-symbol">

                  <span>৳</span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(event) =>
                      setAmount(event.target.value)
                    }
                  />

                </div>

              </div>


              <div>

                <label>
                  Account
                </label>

                <select
                  value={accountId}
                  onChange={(event) =>
                    setAccountId(event.target.value)
                  }
                >

                  <option value="">
                    Select account
                  </option>

                  {accounts.map((account) => (
                    <option
                      key={account.id}
                      value={account.id}
                    >
                      {account.name}
                    </option>
                  ))}

                </select>

              </div>


              <div>

                <label>
                  Category
                </label>

                <select
                  value={categoryId}
                  onChange={(event) =>
                    setCategoryId(event.target.value)
                  }
                >

                  <option value="">
                    Select category
                  </option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}

                </select>

              </div>


              <div>

                <label>
                  Description
                </label>

                <input
                  type="text"
                  placeholder="e.g. Monthly salary"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                />

              </div>

            </div>


            <button
              type="submit"
              className="save-transaction premium-save-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "+ Save Transaction"}
            </button>

          </form>

        </section>


        {/* TRANSACTION LIST */}

        <section className="transaction-list-card premium-list-card">

          <div className="section-title">

            <div>

              <span className="form-eyebrow">
                ACTIVITY
              </span>

              <h2>
                Recent Transactions
              </h2>

              <p>
                Your latest recorded money activity.
              </p>

            </div>

            <span className="transaction-count">
              {transactions.length} Transactions
            </span>

          </div>


          {loading ? (

            <div className="transaction-loading">
              <div className="loading-circle" />
              Loading transactions...
            </div>

          ) : transactions.length === 0 ? (

            <div className="empty-account premium-empty">

              <div className="empty-icon">
                ↕
              </div>

              <h3>
                No transactions yet
              </h3>

              <p>
                Add your first income or expense above.
              </p>

            </div>

          ) : (

            <div className="transaction-table premium-transaction-list">

              {transactions.map((transaction) => {

                const isPositive =
                  transaction.type === "INCOME";

                return (

                  <div
                    className="transaction-row premium-transaction-row"
                    key={transaction.id}
                  >

                    <div
                      className={`transaction-icon ${
                        transaction.type === "INCOME"
                          ? "transaction-income"
                          : transaction.type === "EXPENSE"
                          ? "transaction-expense"
                          : transaction.type === "RECEIVABLE"
                          ? "transaction-receivable"
                          : "transaction-payable"
                      }`}
                    >
                      {getTypeIcon(
                        transaction.type
                      )}
                    </div>


                    <div className="transaction-main-info">

                      <strong>
                        {transaction.description ||
                          getTypeLabel(
                            transaction.type
                          )}
                      </strong>

                      <span>
                        {transaction.account.name}

                        {transaction.category
                          ? ` • ${transaction.category.name}`
                          : ""}
                      </span>

                    </div>


                    <span
                      className={`transaction-type-label ${transaction.type.toLowerCase()}`}
                    >
                      {getTypeLabel(
                        transaction.type
                      )}
                    </span>


                    <strong
                      className={
                        isPositive
                          ? "transaction-positive"
                          : transaction.type ===
                            "RECEIVABLE"
                          ? "transaction-receivable-text"
                          : "transaction-negative"
                      }
                    >
                      {transaction.type ===
                        "INCOME" && "+"}

                      {transaction.type ===
                        "EXPENSE" && "−"}

                      {transaction.type ===
                        "RECEIVABLE" && "↗"}

                      {transaction.type ===
                        "PAYABLE" && "↙"}

                      {" ৳ "}

                      {transaction.amount.toLocaleString()}
                    </strong>


                    <span className="transaction-date">

                      {new Date(
                        transaction.date
                      ).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )}

                    </span>

                  </div>

                );
              })}

            </div>

          )}

        </section>

      </section>

    </main>
  );
}