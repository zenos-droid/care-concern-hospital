import { useEffect, useMemo, useState } from "react";
import { Activity, CalendarCheck, CheckCircle2, ClipboardList, LogOut, RefreshCw, Search, Shield, Stethoscope, UserCheck, Users, XCircle } from "lucide-react";
import { appointmentApi, authApi, AuthUser, clearSession, dashboardApi, paymentApi } from "../services/api";

type DashboardData = any;

export default function DashboardPortal({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const [data, setData] = useState<DashboardData>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const title = useMemo(() => {
    if (user.role === "ADMIN") return "Admin Command Center";
    if (user.role === "DOCTOR") return "Doctor Clinical Dashboard";
    if (user.role === "RECEPTIONIST") return "Reception Operations Desk";
    return "Patient Care Dashboard";
  }, [user.role]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const dashboard = user.role === "ADMIN"
        ? await dashboardApi.admin()
        : user.role === "DOCTOR"
          ? await dashboardApi.doctor()
          : user.role === "RECEPTIONIST"
            ? await dashboardApi.reception()
            : await dashboardApi.patient();
      const list = user.role === "PATIENT" ? [] : await appointmentApi.list();
      setData(dashboard);
      setAppointments(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user.role]);

  const logout = async () => {
    try {
      await authApi.logout().catch(() => null);
    } finally {
      clearSession();
      onLogout();
    }
  };

  const mutateAppointment = async (action: "approve" | "checkIn" | "cancel", id: string) => {
    setMessage("");
    setError("");
    try {
      if (action === "approve") await appointmentApi.approve(id);
      if (action === "checkIn") await appointmentApi.checkIn(id);
      if (action === "cancel") await appointmentApi.cancel(id, "Cancelled from operations portal");
      setMessage("Appointment updated successfully.");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    }
  };

  return (
    <section id="portal-dashboard" className="py-16 bg-slate-50 border-y border-slate-150 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between gap-4 md:items-center mb-6">
          <div>
            <span className="text-sky-600 text-xs font-bold uppercase tracking-widest bg-sky-50 px-3 py-1.5 rounded-full border border-sky-100">
              {user.role}
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">{title}</h2>
            <p className="text-sm text-slate-500 mt-1">Signed in as {user.fullName}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="bg-white border border-slate-200 text-slate-700 rounded-xl px-4 py-3 text-xs font-black flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button onClick={logout} className="bg-slate-900 text-white rounded-xl px-4 py-3 text-xs font-black flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-800 text-xs font-bold rounded-xl p-3">{error}</div>}
        {message && <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl p-3">{message}</div>}

        {loading ? (
          <div className="bg-white border border-slate-150 rounded-2xl p-8 text-sm font-bold text-slate-500">Loading live hospital data...</div>
        ) : (
          <>
            <StatsGrid user={user} data={data} />
            <RoleDetails user={user} data={data} appointments={appointments} onAction={mutateAppointment} />
          </>
        )}
      </div>
    </section>
  );
}

function StatsGrid({ user, data }: { user: AuthUser; data: DashboardData }) {
  const stats = user.role === "ADMIN"
    ? [
      ["Total Patients", data?.totalPatients ?? 0, Users],
      ["Total Appointments", data?.totalAppointments ?? 0, CalendarCheck],
      ["Revenue", `INR ${data?.revenue ?? 0}`, Activity],
      ["Doctors", data?.doctorAnalytics?.length ?? 0, Stethoscope]
    ]
    : user.role === "DOCTOR"
      ? [
        ["Today Queue", data?.todayQueue ?? 0, ClipboardList],
        ["Pending Approvals", data?.pendingApprovals ?? 0, Shield],
        ["Completed This Month", data?.completedThisMonth ?? 0, CheckCircle2],
        ["Upcoming", data?.upcoming?.length ?? 0, CalendarCheck]
      ]
      : user.role === "RECEPTIONIST"
        ? [
          ["Pending", data?.pending ?? 0, Shield],
          ["Checked In", data?.checkedIn ?? 0, UserCheck],
          ["Today Visits", data?.todaysAppointments?.length ?? 0, CalendarCheck],
          ["Recent Patients", data?.recentPatients?.length ?? 0, Users]
        ]
        : [
          ["Upcoming", data?.upcoming?.length ?? 0, CalendarCheck],
          ["Medical Records", data?.records?.length ?? 0, ClipboardList],
          ["Notifications", data?.notifications?.length ?? 0, Shield],
          ["Care Status", "Active", CheckCircle2]
        ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map(([label, value, Icon]) => (
        <div key={String(label)} className="bg-white border border-slate-150 rounded-2xl p-5">
          <div className="w-10 h-10 bg-sky-50 text-sky-700 rounded-xl flex items-center justify-center mb-4">
            <Icon className="w-5 h-5" />
          </div>
          <p className="text-xs font-black uppercase tracking-widest text-slate-400">{String(label)}</p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{String(value)}</p>
        </div>
      ))}
    </div>
  );
}

function RoleDetails({
  user,
  data,
  appointments,
  onAction
}: {
  user: AuthUser;
  data: DashboardData;
  appointments: any[];
  onAction: (action: "approve" | "checkIn" | "cancel", id: string) => void;
}) {
  if (user.role === "PATIENT") {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Panel title="Upcoming Appointments">
          <AppointmentList items={data?.upcoming ?? []} />
        </Panel>
        <Panel title="Medical Records">
          {(data?.records ?? []).length === 0 ? <Empty /> : (data.records ?? []).map((record: any) => (
            <div key={record.id} className="border border-slate-150 rounded-xl p-3 text-xs">
              <p className="font-black text-slate-900">{record.diagnosis}</p>
              <p className="text-slate-500 mt-1">{record.prescription || "Prescription not added"}</p>
            </div>
          ))}
        </Panel>
        <Panel title="Payment History">
          <PaymentList items={data?.payments ?? []} />
        </Panel>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      <div className="lg:col-span-8">
        <Panel title="Live Appointments">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="py-2">Ticket</th>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Status</th>
                  <th>Slot</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {appointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="py-3 font-mono font-bold text-sky-700">{appointment.ticketNumber}</td>
                    <td className="font-bold text-slate-800">{appointment.patient?.fullName}</td>
                    <td className="text-slate-600">{appointment.doctor?.fullName}</td>
                    <td><span className="bg-slate-100 rounded-lg px-2 py-1 font-black text-slate-600">{appointment.status}</span></td>
                    <td className="text-slate-500">{new Date(appointment.scheduledDate).toLocaleDateString()} {appointment.slot}</td>
                    <td>
                      <div className="flex justify-end gap-1.5">
                        {(user.role === "ADMIN" || user.role === "DOCTOR" || user.role === "RECEPTIONIST") && (
                          <button onClick={() => onAction("approve", appointment.id)} className="p-2 bg-emerald-50 text-emerald-700 rounded-lg" title="Approve"><CheckCircle2 className="w-4 h-4" /></button>
                        )}
                        {(user.role === "ADMIN" || user.role === "RECEPTIONIST") && (
                          <button onClick={() => onAction("checkIn", appointment.id)} className="p-2 bg-sky-50 text-sky-700 rounded-lg" title="Check in"><UserCheck className="w-4 h-4" /></button>
                        )}
                        <button onClick={() => onAction("cancel", appointment.id)} className="p-2 bg-red-50 text-red-700 rounded-lg" title="Cancel"><XCircle className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {appointments.length === 0 && <Empty />}
        </Panel>
      </div>
      <div className="lg:col-span-4">
        <Panel title={user.role === "ADMIN" ? "Doctor Analytics" : "Operations Snapshot"}>
          {user.role === "ADMIN" ? (data?.doctorAnalytics ?? []).map((doctor: any) => (
            <div key={doctor.id} className="border border-slate-150 rounded-xl p-3 text-xs">
              <p className="font-black text-slate-900">{doctor.fullName}</p>
              <p className="text-slate-500">{doctor.department?.name}</p>
              <p className="text-sky-700 font-bold mt-1">{doctor._count?.appointments ?? 0} appointments</p>
            </div>
          )) : (
            <AppointmentList items={data?.todaysAppointments ?? data?.upcoming ?? []} />
          )}
        </Panel>
        {user.role === "ADMIN" && (
          <Panel title="Revenue Overview">
            <div className="text-xs bg-emerald-50 border border-emerald-100 rounded-xl p-3">
              <p className="font-black text-emerald-900">INR {data?.revenue ?? 0}</p>
              <p className="text-emerald-700 mt-1">Failed payments: {data?.failedPayments ?? 0}</p>
            </div>
            {Object.entries(data?.departmentRevenue ?? {}).map(([department, amount]) => (
              <div key={department} className="flex justify-between border border-slate-150 rounded-xl p-3 text-xs">
                <span className="font-bold text-slate-700">{department}</span>
                <span className="font-black text-slate-900">INR {String(amount)}</span>
              </div>
            ))}
          </Panel>
        )}
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-slate-150 rounded-2xl p-5">
      <h3 className="font-black text-slate-900 mb-4 flex items-center gap-2">
        <Search className="w-4 h-4 text-sky-600" /> {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function AppointmentList({ items }: { items: any[] }) {
  if (!items.length) return <Empty />;
  return (
    <>
      {items.map((appointment) => (
        <div key={appointment.id} className="border border-slate-150 rounded-xl p-3 text-xs">
          <p className="font-black text-slate-900">{appointment.ticketNumber || appointment.patient?.fullName || "Appointment"}</p>
          <p className="text-slate-500 mt-1">{appointment.doctor?.fullName} · {appointment.slot}</p>
          <p className="text-sky-700 font-bold mt-1">{appointment.status}</p>
        </div>
      ))}
    </>
  );
}

function PaymentList({ items }: { items: any[] }) {
  if (!items.length) return <Empty />;
  return (
    <>
      {items.map((payment) => (
        <div key={payment.id} className="border border-slate-150 rounded-xl p-3 text-xs">
          <div className="flex justify-between gap-3">
            <div>
              <p className="font-black text-slate-900">INR {payment.amount} - {payment.status}</p>
              <p className="text-slate-500 mt-1">{payment.appointment?.doctor?.fullName || "Appointment payment"}</p>
              <p className="font-mono text-sky-700 mt-1">{payment.receiptNumber}</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <button onClick={() => window.open(paymentApi.ticketUrl(payment.id), "_blank", "noopener,noreferrer")} className="bg-sky-50 text-sky-700 rounded-lg px-3 py-2 font-black">Ticket</button>
              <button onClick={() => window.open(paymentApi.receiptUrl(payment.id), "_blank", "noopener,noreferrer")} className="bg-emerald-50 text-emerald-700 rounded-lg px-3 py-2 font-black">Receipt</button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

function Empty() {
  return <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-5 text-xs font-bold text-slate-400 text-center">No records found.</div>;
}
