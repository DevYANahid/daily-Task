import Link from "next/link";
import prisma from "@/src/lib/prisma";

export default async function Home() {
  const accounts = await prisma.account.findMany({
    where: {
      active: true,
    },
    orderBy: {
      id: "asc",
    },
    include: {
      transactions: true,
    },
  });

  const people = await prisma.person.findMany({
    where: {
      active: true,
    },
    orderBy: {
      id: "asc",
    },
    include: {
      debts: {
        include: {
          payments: true,
        },
      },
    },
  });

  const transactions = await prisma.transaction.findMany({
    orderBy: {
      date: "desc",
    },
    take: 8,
    include: {
      account: true,
      category: true,
      person: true,
    },
  });

  const totalBalance = accounts.reduce((total, account) => {
    let balance = account.openingBalance;

    for (const transaction of account.transactions) {
      if (transaction.type === "INCOME") {
        balance += transaction.amount;
      }

      if (transaction.type === "EXPENSE") {
        balance -= transaction.amount;
      }

      if (transaction.type === "RECEIVABLE") {
        balance -= transaction.amount;
      }
    }

    return total + balance;
  }, 0);

  const totalReceivable = people.reduce((total, person) => {
    return (
      total +
      person.debts
        .filter((debt) => debt.type === "RECEIVABLE")
        .reduce((sum, debt) => {
          const paid = debt.payments.reduce(
            (paymentTotal, payment) => paymentTotal + payment.amount,
            0
          );

          return sum + Math.max(debt.amount - paid, 0);
        }, 0)
    );
  }, 0);

  const totalPayable = people.reduce((total, person) => {
    return (
      total +
      person.debts
        .filter((debt) => debt.type === "PAYABLE")
        .reduce((sum, debt) => {
          const paid = debt.payments.reduce(
            (paymentTotal, payment) => paymentTotal + payment.amount,
            0
          );

          return sum + Math.max(debt.amount - paid, 0);
        }, 0)
    );
  }, 0);

  const totalIncome = transactions
    .filter((transaction) => transaction.type === "INCOME")
    .reduce((total, transaction) => total + transaction.amount, 0);

  const totalExpense = transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .reduce((total, transaction) => total + transaction.amount, 0);

  return (
    <main className="app-shell">
      {/* Sidebar */}
      <aside className="sidebar">
        <Link href="/" className="brand">
          <div className="brand-icon">M</div>

          <div>
            <strong>MoneyTrack</strong>
            <span>Personal Finance</span>
          </div>
        </Link>

        <nav className="sidebar-nav">
          <span className="nav-label">MAIN MENU</span>

          <Link href="/" className="nav-item active">
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

          <Link href="/people" className="nav-item">
            <span>♙</span>
            People
          </Link>

          <Link href="/debts" className="nav-item">
            <span>৳</span>
            পাওনা / দেনা
          </Link>

          <span className="nav-label second-label">MANAGE</span>

          <Link href="/reports" className="nav-item">
            <span>◫</span>
            Reports
          </Link>

          <Link href="/settings" className="nav-item">
            <span>⚙</span>
            Settings
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <div className="security-card">
            <div className="security-icon">✓</div>

            <div>
              <strong>Your money, organized.</strong>
              <span>Track every taka with confidence.</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <section className="main-content">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">GOOD TO SEE YOU</p>

            <h1>Financial Overview</h1>

            <p className="header-subtitle">
              Track your money. Control your future.
            </p>
          </div>

          <Link href="/transactions" className="add-transaction-button">
            <span>+</span>
            Add Transaction
          </Link>
        </header>

        {/* Wallet */}
        <section className="wallet-card">
          <div className="wallet-top">
            <div>
              <span className="wallet-label">TOTAL BALANCE</span>

              <h2>
                ৳ {totalBalance.toLocaleString()}
              </h2>

              <span className="wallet-status">
                ● Your current available balance
              </span>
            </div>

            <div className="wallet-mark">
              ৳
            </div>
          </div>

          <div className="wallet-bottom">
            <div>
              <span>Income</span>
              <strong>
                + ৳ {totalIncome.toLocaleString()}
              </strong>
            </div>

            <div>
              <span>Expense</span>
              <strong>
                − ৳ {totalExpense.toLocaleString()}
              </strong>
            </div>

            <div>
              <span>Net Position</span>
              <strong>
                ৳ {(totalIncome - totalExpense).toLocaleString()}
              </strong>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="finance-summary">
          <div className="finance-card">
            <div className="finance-icon receivable-icon">
              ↗
            </div>

            <div>
              <span>Receivable</span>
              <strong>
                ৳ {totalReceivable.toLocaleString()}
              </strong>
              <small>Money you will receive</small>
            </div>
          </div>

          <div className="finance-card">
            <div className="finance-icon payable-icon">
              ↙
            </div>

            <div>
              <span>Payable</span>
              <strong>
                ৳ {totalPayable.toLocaleString()}
              </strong>
              <small>Money you need to pay</small>
            </div>
          </div>

          <div className="finance-card">
            <div className="finance-icon income-icon">
              ↑
            </div>

            <div>
              <span>Income</span>
              <strong>
                ৳ {totalIncome.toLocaleString()}
              </strong>
              <small>Recent recorded income</small>
            </div>
          </div>

          <div className="finance-card">
            <div className="finance-icon expense-icon">
              ↓
            </div>

            <div>
              <span>Expense</span>
              <strong>
                ৳ {totalExpense.toLocaleString()}
              </strong>
              <small>Recent recorded expense</small>
            </div>
          </div>
        </section>

        {/* Quick actions */}
        <section className="quick-actions">
          <div>
            <h2>Quick Actions</h2>
            <p>Manage your money faster.</p>
          </div>

          <div className="quick-action-list">
            <Link href="/transactions" className="quick-action">
              <span>＋</span>
              <div>
                <strong>Add Transaction</strong>
                <small>Income or expense</small>
              </div>
            </Link>

            <Link href="/accounts" className="quick-action">
              <span>▣</span>
              <div>
                <strong>Manage Accounts</strong>
                <small>Bank, cash & wallets</small>
              </div>
            </Link>

            <Link href="/people" className="quick-action">
              <span>♙</span>
              <div>
                <strong>Manage People</strong>
                <small>Contacts & balances</small>
              </div>
            </Link>

            <Link href="/debts" className="quick-action">
              <span>৳</span>
              <div>
                <strong>পাওনা / দেনা</strong>
                <small>Track money owed</small>
              </div>
            </Link>
          </div>
        </section>

        {/* Content */}
        <section className="dashboard-grid">
          {/* Accounts */}
          <div className="dashboard-panel">
            <div className="panel-title">
              <div>
                <h2>My Accounts</h2>
                <p>Your money across all accounts</p>
              </div>

              <Link href="/accounts">View all →</Link>
            </div>

            {accounts.length === 0 ? (
              <div className="empty-dashboard">
                <span>▣</span>
                <strong>No accounts yet</strong>
                <p>Add your first account.</p>

                <Link href="/accounts">
                  Add Account
                </Link>
              </div>
            ) : (
              <div className="premium-account-list">
                {accounts.slice(0, 5).map((account) => {
                  let balance = account.openingBalance;

                  for (const transaction of account.transactions) {
                    if (transaction.type === "INCOME") {
                      balance += transaction.amount;
                    }

                    if (transaction.type === "EXPENSE") {
                      balance -= transaction.amount;
                    }

                    if (transaction.type === "RECEIVABLE") {
                      balance -= transaction.amount;
                    }
                  }

                  return (
                    <div
                      className="premium-account"
                      key={account.id}
                    >
                      <div className="account-symbol">
                        ৳
                      </div>

                      <div className="account-details">
                        <strong>{account.name}</strong>
                        <span>{account.type}</span>
                      </div>

                      <strong className="account-total">
                        ৳ {balance.toLocaleString()}
                      </strong>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* People */}
          <div className="dashboard-panel">
            <div className="panel-title">
              <div>
                <h2>People</h2>
                <p>People connected to your money</p>
              </div>

              <Link href="/people">View all →</Link>
            </div>

            {people.length === 0 ? (
              <div className="empty-dashboard">
                <span>♙</span>
                <strong>No people yet</strong>
                <p>Add people to track debts.</p>

                <Link href="/people">
                  Add Person
                </Link>
              </div>
            ) : (
              <div className="premium-account-list">
                {people.slice(0, 5).map((person) => (
                  <div
                    className="premium-account"
                    key={person.id}
                  >
                    <div className="person-avatar">
                      {person.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="account-details">
                      <strong>{person.name}</strong>

                      <span>
                        {person.phone || "No phone"}
                      </span>
                    </div>

                    <Link
                      href="/people"
                      className="small-view"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Recent Transactions */}
        <section className="dashboard-panel transactions-dashboard">
          <div className="panel-title">
            <div>
              <h2>Recent Transactions</h2>
              <p>Your latest money activity</p>
            </div>

            <Link href="/transactions">
              View all →
            </Link>
          </div>

          {transactions.length === 0 ? (
            <div className="empty-dashboard">
              <span>↕</span>
              <strong>No transactions yet</strong>
              <p>Your recent transactions will appear here.</p>

              <Link href="/transactions">
                Add Transaction
              </Link>
            </div>
          ) : (
            <div className="premium-transactions">
              {transactions.map((transaction) => {
                const isIncome =
                  transaction.type === "INCOME";

                return (
                  <div
                    className="premium-transaction"
                    key={transaction.id}
                  >
                    <div
                      className={`transaction-icon ${
                        isIncome
                          ? "transaction-income"
                          : "transaction-expense"
                      }`}
                    >
                      {isIncome ? "↑" : "↓"}
                    </div>

                    <div className="transaction-info">
                      <strong>
                        {transaction.description ||
                          transaction.type}
                      </strong>

                      <span>
                        {transaction.account.name}

                        {transaction.category
                          ? ` • ${transaction.category.name}`
                          : ""}
                      </span>
                    </div>

                    <strong
                      className={
                        isIncome
                          ? "transaction-positive"
                          : "transaction-negative"
                      }
                    >
                      {isIncome ? "+" : "-"} ৳{" "}
                      {transaction.amount.toLocaleString()}
                    </strong>
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