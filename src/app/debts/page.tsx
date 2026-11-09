"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Person = {
  id: number;
  name: string;
};

type Debt = {
  id: number;
  type: "RECEIVABLE" | "PAYABLE";
  amount: number;
  paid: number;
  remaining: number;
  description: string | null;
  date: string;
  status: "OPEN" | "PARTIAL" | "PAID";
  person: Person;
};

export default function DebtsPage() {
  const [people, setPeople] = useState<Person[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);

  const [type, setType] =
    useState<"RECEIVABLE" | "PAYABLE">("RECEIVABLE");

  const [personId, setPersonId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadData() {
    try {
      const [peopleResponse, debtsResponse] =
        await Promise.all([
          fetch("/api/people"),
          fetch("/api/debts"),
        ]);

      const peopleData = await peopleResponse.json();
      const debtsData = await debtsResponse.json();

      if (peopleResponse.ok) {
        setPeople(peopleData);
      }

      if (debtsResponse.ok) {
        setDebts(debtsData);
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

    const numericAmount = Number(amount);

    if (!personId) {
      alert("Please select a person");
      return;
    }

    if (!numericAmount || numericAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/debts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type,
          amount: numericAmount,
          personId: Number(personId),
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to create debt");
        return;
      }

      setPersonId("");
      setAmount("");
      setDescription("");

      await loadData();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  const totalReceivable = debts
    .filter((debt) => debt.type === "RECEIVABLE")
    .reduce(
      (total, debt) => total + debt.remaining,
      0
    );

  const totalPayable = debts
    .filter((debt) => debt.type === "PAYABLE")
    .reduce(
      (total, debt) => total + debt.remaining,
      0
    );

  const netPosition =
    totalReceivable - totalPayable;

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
            className="nav-item"
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
            className="nav-item active"
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


      {/* MAIN */}

      <section className="main-content">

        {/* HEADER */}

        <header className="dashboard-header">

          <div>

            <p className="eyebrow">
              MONEY OWED
            </p>

            <h1>
              পাওনা / দেনা
            </h1>

            <p className="header-subtitle">
              Track money you need to receive or pay.
            </p>

          </div>

          <Link
            href="/"
            className="add-transaction-button"
          >
            ← Dashboard
          </Link>

        </header>


        {/* SUMMARY */}

        <section className="debt-premium-summary">

          <div className="debt-premium-card receivable">

            <div className="debt-card-icon">
              ↗
            </div>

            <div>
              <span>
                আমার পাওনা
              </span>

              <strong>
                ৳ {totalReceivable.toLocaleString()}
              </strong>

              <small>
                Money you will receive
              </small>
            </div>

          </div>


          <div className="debt-premium-card payable">

            <div className="debt-card-icon">
              ↙
            </div>

            <div>
              <span>
                আমার দেনা
              </span>

              <strong>
                ৳ {totalPayable.toLocaleString()}
              </strong>

              <small>
                Money you need to pay
              </small>
            </div>

          </div>


          <div className="debt-premium-card net">

            <div className="debt-card-icon">
              ৳
            </div>

            <div>
              <span>
                Net Position
              </span>

              <strong>
                ৳ {netPosition.toLocaleString()}
              </strong>

              <small>
                Receivable minus payable
              </small>
            </div>

          </div>

        </section>


        {/* ADD DEBT */}

        <section className="debt-premium-form">

          <div className="debt-form-header">

            <div>

              <span className="form-eyebrow">
                MONEY ENTRY
              </span>

              <h2>
                Add Debt Entry
              </h2>

              <p>
                Record money you need to receive or pay.
              </p>

            </div>

            <div className="debt-form-mark">
              ৳
            </div>

          </div>


          <div className="debt-type-buttons premium-debt-type">

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
              আমি পাব
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
              আমি দেব
            </button>

          </div>


          <form onSubmit={handleSubmit}>

            <div className="debt-form-grid">

              <div className="form-group">

                <label>
                  Person
                </label>

                <select
                  value={personId}
                  onChange={(event) =>
                    setPersonId(event.target.value)
                  }
                >

                  <option value="">
                    Select person
                  </option>

                  {people.map((person) => (
                    <option
                      key={person.id}
                      value={person.id}
                    >
                      {person.name}
                    </option>
                  ))}

                </select>

              </div>


              <div className="form-group">

                <label>
                  Amount
                </label>

                <div className="debt-input-wrapper">

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


              <div className="form-group debt-description">

                <label>
                  Description
                </label>

                <input
                  type="text"
                  placeholder="e.g. Rahim borrowed money"
                  value={description}
                  onChange={(event) =>
                    setDescription(event.target.value)
                  }
                />

              </div>

            </div>


            <button
              type="submit"
              className="debt-save-button"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : "+ Save Entry"}
            </button>

          </form>

        </section>


        {/* DEBT RECORDS */}

        <section className="debt-records-card">

          <div className="debt-records-header">

            <div>

              <span className="form-eyebrow">
                MONEY RECORDS
              </span>

              <h2>
                Debt Records
              </h2>

              <p>
                All your receivable and payable records.
              </p>

            </div>

            <span className="debt-count">
              {debts.length} entries
            </span>

          </div>


          {loading ? (

            <div className="debt-loading">
              <div className="loading-circle" />
              Loading debt records...
            </div>

          ) : debts.length === 0 ? (

            <div className="debt-empty">

              <div className="debt-empty-icon">
                ৳
              </div>

              <h3>
                No debt records
              </h3>

              <p>
                Add your first receivable or payable entry.
              </p>

            </div>

          ) : (

            <div className="premium-debt-list">

              {debts.map((debt) => (

                <div
                  className="premium-debt-row"
                  key={debt.id}
                >

                  <div
                    className={`premium-debt-icon ${
                      debt.type === "RECEIVABLE"
                        ? "receivable"
                        : "payable"
                    }`}
                  >
                    {debt.type === "RECEIVABLE"
                      ? "↗"
                      : "↙"}
                  </div>


                  <div className="premium-debt-person">

                    <strong>
                      {debt.person.name}
                    </strong>

                    <span>
                      {debt.description ||
                        (debt.type ===
                        "RECEIVABLE"
                          ? "Money to receive"
                          : "Money to pay")}
                    </span>

                  </div>


                  <div className="premium-debt-type">

                    <span
                      className={`debt-label ${
                        debt.type === "RECEIVABLE"
                          ? "receivable"
                          : "payable"
                      }`}
                    >
                      {debt.type ===
                      "RECEIVABLE"
                        ? "আমি পাব"
                        : "আমি দেব"}
                    </span>

                  </div>


                  <div className="debt-amount-block">

                    <span>
                      Original
                    </span>

                    <strong>
                      ৳ {debt.amount.toLocaleString()}
                    </strong>

                  </div>


                  <div className="debt-amount-block">

                    <span>
                      Paid
                    </span>

                    <strong>
                      ৳ {debt.paid.toLocaleString()}
                    </strong>

                  </div>


                  <div className="debt-amount-block remaining">

                    <span>
                      Remaining
                    </span>

                    <strong>
                      ৳ {debt.remaining.toLocaleString()}
                    </strong>

                  </div>


                  <span
                    className={`debt-status premium-status ${debt.status.toLowerCase()}`}
                  >
                    {debt.status}
                  </span>


                  <div className="premium-debt-date">

                    {new Date(
                      debt.date
                    ).toLocaleDateString(
                      "en-GB",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }
                    )}

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

      </section>

    </main>
  );
}