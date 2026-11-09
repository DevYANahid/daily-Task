"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Person = {
  id: number;
  name: string;
  phone: string | null;
  note: string | null;
  receivable: number;
  payable: number;
  balance: number;
};

export default function PeoplePage() {
  const [people, setPeople] = useState<Person[]>([]);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function loadPeople() {
    try {
      const response = await fetch("/api/people");
      const data = await response.json();

      if (response.ok) {
        setPeople(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPeople();
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!name.trim()) {
      alert("Person name is required");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/people", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          phone,
          note,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to create person");
        return;
      }

      setName("");
      setPhone("");
      setNote("");

      await loadPeople();
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = confirm(
      "Are you sure you want to deactivate this person?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`/api/people/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await loadPeople();
      }
    } catch (error) {
      console.error(error);
    }
  }

  const totalReceivable = people.reduce(
    (sum, person) => sum + person.receivable,
    0
  );

  const totalPayable = people.reduce(
    (sum, person) => sum + person.payable,
    0
  );

  const netBalance = totalReceivable - totalPayable;

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">M</div>

          <div>
            <h2>MoneyTrack</h2>
            <span>Personal Finance</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <Link href="/" className="nav-item">
            <span>⌂</span>
            Dashboard
          </Link>

          <Link href="/accounts" className="nav-item">
            <span>▣</span>
            Accounts
          </Link>

          <Link href="/transactions" className="nav-item">
            <span>↕</span>
            Transactions
          </Link>

          <Link href="/people" className="nav-item active">
            <span>♙</span>
            People
          </Link>

          <Link href="/debts" className="nav-item">
            <span>৳</span>
            পাওনা / দেনা
          </Link>

          <Link href="/reports" className="nav-item">
            <span>▤</span>
            Reports
          </Link>

          <Link href="/settings" className="nav-item">
            <span>⚙</span>
            Settings
          </Link>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer-icon">✓</div>

          <div>
            <strong>Money under control</strong>
            <span>Track every taka.</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        <div className="page-header premium-page-header">
          <div>
            <span className="page-eyebrow">CONTACTS & DEBTS</span>

            <h1>People</h1>

            <p>
              Manage people and keep track of money you owe or are owed.
            </p>
          </div>

          <Link href="/debts" className="header-action-button">
            + Manage Debts
          </Link>
        </div>

        {/* Summary */}
        <div className="people-summary">
          <div className="people-summary-card">
            <div className="people-summary-icon receivable-icon">
              ↓
            </div>

            <div>
              <span>Total Receivable</span>
              <strong>
                ৳ {totalReceivable.toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="people-summary-card">
            <div className="people-summary-icon payable-icon">
              ↑
            </div>

            <div>
              <span>Total Payable</span>
              <strong>
                ৳ {totalPayable.toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="people-summary-card">
            <div className="people-summary-icon balance-icon">
              ৳
            </div>

            <div>
              <span>Net Position</span>
              <strong
                className={
                  netBalance >= 0
                    ? "summary-positive"
                    : "summary-negative"
                }
              >
                ৳ {netBalance.toLocaleString()}
              </strong>
            </div>
          </div>

          <div className="people-summary-card">
            <div className="people-summary-icon people-icon">
              ♙
            </div>

            <div>
              <span>Total People</span>
              <strong>{people.length}</strong>
            </div>
          </div>
        </div>

        <div className="people-layout premium-people-layout">
          {/* Add Person */}
          <section className="form-card people-form-card">
            <div className="card-heading">
              <div className="card-heading-icon">+</div>

              <div>
                <h2>Add Person</h2>
                <p>Add someone to track their balance.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>

                <input
                  type="text"
                  placeholder="e.g. Rahim"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Phone</label>

                <input
                  type="text"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Note</label>

                <textarea
                  placeholder="Optional note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                />
              </div>

              <button
                type="submit"
                className="primary-button people-submit-button"
                disabled={saving}
              >
                {saving ? "Saving..." : "Add Person"}
              </button>
            </form>
          </section>

          {/* People List */}
          <section className="people-list-card premium-people-list-card">
            <div className="section-heading">
              <div>
                <h2>People</h2>
                <p>Your people and their current financial position.</p>
              </div>

              <span className="people-count">
                {people.length}{" "}
                {people.length === 1 ? "person" : "people"}
              </span>
            </div>

            {loading ? (
              <div className="people-loading">
                <div className="loading-spinner"></div>
                <p>Loading people...</p>
              </div>
            ) : people.length === 0 ? (
              <div className="empty-state premium-empty-state">
                <div className="empty-icon">♙</div>

                <h3>No people yet</h3>

                <p>
                  Add someone to start tracking debts and balances.
                </p>
              </div>
            ) : (
              <div className="people-list premium-people-list">
                {people.map((person) => (
                  <div
                    className="person-card premium-person-card"
                    key={person.id}
                  >
                    <div className="person-avatar">
                      {person.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="person-info">
                      <h3>{person.name}</h3>

                      {person.phone && (
                        <p>☎ {person.phone}</p>
                      )}

                      {person.note && (
                        <small>{person.note}</small>
                      )}
                    </div>

                    <div className="person-money">
                      <div className="person-money-item">
                        <span>Receivable</span>

                        <strong className="money-positive">
                          ৳ {person.receivable.toLocaleString()}
                        </strong>
                      </div>

                      <div className="person-money-item">
                        <span>Payable</span>

                        <strong className="money-negative">
                          ৳ {person.payable.toLocaleString()}
                        </strong>
                      </div>

                      <div className="person-money-item person-balance">
                        <span>Balance</span>

                        <strong
                          className={
                            person.balance >= 0
                              ? "money-positive"
                              : "money-negative"
                          }
                        >
                          ৳ {person.balance.toLocaleString()}
                        </strong>
                      </div>
                    </div>

                    <div className="person-actions">
                      <Link
                        href={`/debts?person=${person.id}`}
                        className="view-person-button"
                      >
                        View
                      </Link>

                      <button
                        className="delete-button"
                        onClick={() => handleDelete(person.id)}
                      >
                        Deactivate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}