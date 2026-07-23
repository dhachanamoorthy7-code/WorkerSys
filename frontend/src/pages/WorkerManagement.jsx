import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  ShieldAlert,
  Briefcase,
  Calendar,
  DollarSign,
  Star,
  Camera,
  FileText,
  X,
  Clock,
  Download,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../services/api";

export const WorkerManagement = () => {
  const { user, hasRole } = useAuth();
  const { t } = useLanguage();

  const [workers, setWorkers] = useState([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [detailWorker, setDetailWorker] = useState(null);
  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editWorkerId, setEditWorkerId] = useState(null);

  // Form Fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("Production");
  const [designation, setDesignation] = useState("");
  const [address, setAddress] = useState("");
  const [dateOfJoining, setDateOfJoining] = useState("");
  const [shiftTiming, setShiftTiming] = useState("08:00 AM - 04:00 PM");
  const [salary, setSalary] = useState("");
  const [status, setStatus] = useState("Active");
  const [rating, setRating] = useState("5.0");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [photo, setPhoto] = useState("");
  // Camera simulation state
  const [cameraActive, setCameraActive] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const departmentsList = [
    "Production",
    "Packing",
    "Quality",
    "Maintenance",
    "HR",
    "Security",
    "Warehouse",
    "Administration",
  ];

  const statusList = [
    "Active",
    "Working",
    "Idle",
    "On Break",
    "Leave",
    "Sick Leave",
    "Vacation",
    "Overtime",
    "Night Shift",
    "Completed Shift",
    "Inactive",
  ];

  useEffect(() => {
    fetchWorkers();
  }, [search, deptFilter, statusFilter]);

  const fetchWorkers = async () => {
    try {
      setLoading(true);
      const data = await api.workers.getAll({
        search,
        department: deptFilter,
        status: statusFilter,
      });
      setWorkers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditWorkerId(null);
    setName("");
    setEmail("");
    setPhone("");
    setDepartment("Production");
    setDesignation("");
    setAddress("");
    setDateOfJoining(new Date().toISOString().split("T")[0]);
    setShiftTiming("08:00 AM - 04:00 PM");
    setSalary("");
    setStatus("Active");
    setRating("5.0");
    setEmergencyName("");
    setEmergencyRelation("");
    setEmergencyPhone("");
    setPhoto("");
    setModalOpen(true);
  };

  const handleOpenEdit = (worker) => {
    setEditWorkerId(worker.id);
    setName(worker.name);
    setEmail(worker.email);
    setPhone(worker.phone);
    setDepartment(worker.department);
    setDesignation(worker.designation);
    setAddress(worker.address);
    setDateOfJoining(worker.dateOfJoining);
    setShiftTiming(worker.shiftTiming);
    setSalary(worker.salary.toString());
    setStatus(worker.status);
    setRating(worker.performanceRating.toString());
    setEmergencyName(worker.emergencyContact?.name || "");
    setEmergencyRelation(worker.emergencyContact?.relation || "");
    setEmergencyPhone(worker.emergencyContact?.phone || "");
    setPhoto(worker.photo || "");
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this worker's record?")
    ) {
      try {
        await api.workers.delete(id);
        fetchWorkers();
        if (detailWorker && detailWorker.id === id) {
          setDetailWorker(null);
        }
      } catch (err) {
        alert(err.message || "Deletion failed.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      email,
      phone,
      department,
      designation,
      address,
      dateOfJoining,
      shiftTiming,
      salary: Number(salary) || 0,
      status,
      performanceRating: Number(rating) || 5.0,
      emergencyContact: {
        name: emergencyName,
        relation: emergencyRelation,
        phone: emergencyPhone,
      },
      photo,
      documents: editWorkerId ? undefined : ["Contract.pdf", "ID_Proof.pdf"], // seed mock files
    };

    try {
      if (editWorkerId) {
        await api.workers.update(editWorkerId, payload);
      } else {
        await api.workers.create(payload);
      }
      setModalOpen(false);
      fetchWorkers();
    } catch (err) {
      alert(err.message || "Failed to save profile.");
    }
  };

  const handleExportCSV = () => {
    if (workers.length === 0) return;
    const headers = [
      "ID",
      "Name",
      "Email",
      "Phone",
      "Department",
      "Designation",
      "Shift",
      "Salary",
      "Status",
      "Rating",
    ];
    const rows = workers.map((w) => [
      w.id,
      w.name,
      w.email || "N/A",
      w.phone,
      w.department,
      w.designation,
      w.shiftTiming,
      w.salary,
      w.status,
      w.performanceRating,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...rows.map((e) =>
          e
            .map((val) => `"${val.toString().replace(/"/g, '""')}"`)
            .join(","),
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `workers_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Camera Capture Simulation
  const startCamera = async () => {
    setCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 300, height: 220 },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.log(
        "No physical camera detected, using canvas demo capture simulator.",
      );
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = video.videoWidth || 300;
        canvas.height = video.videoHeight || 220;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg");
        setPhoto(dataUrl);
        stopCamera();
      }
    } else {
      // Simulate placeholder generation
      const canvas = document.createElement("canvas");
      canvas.width = 150;
      canvas.height = 150;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#3b82f6";
        ctx.fillRect(0, 0, 150, 150);
        ctx.fillStyle = "#ffffff";
        ctx.font = "24px Outfit";
        ctx.fillText(name ? name.charAt(0) : "W", 65, 85);
        setPhoto(canvas.toDataURL("image/jpeg"));
      }
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const showWorkerDetail = async (id) => {
    try {
      const data = await api.workers.getOne(id);
      setDetailWorker(data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("workers")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Add, edit, inspect and search employee personnel records.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-650 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350 transition-all shrink-0"
          >
            <Download size={16} />
            Export CSV
          </button>
          {hasRole(["Admin", "HR", "Supervisor"]) && (
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-all shrink-0"
            >
              <Plus size={16} />
              {t("addWorker")}
            </button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      <Card className="p-4 flex flex-col md:flex-row md:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute inset-y-0 left-3 top-3 text-slate-400"
          />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200/80 bg-slate-50 pl-10 pr-4 py-2 text-sm outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:focus:border-blue-500"
          />
        </div>

        {/* Dept Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter size={14} className="text-slate-450" />
          <span className="text-xs font-semibold text-slate-500">Dept:</span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-xs font-medium outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950"
          >
            <option value="All">All Departments</option>
            {departmentsList.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <Filter size={14} className="text-slate-450" />
          <span className="text-xs font-semibold text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-xs font-medium outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950"
          >
            <option value="All">All Statuses</option>
            {statusList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </Card>

      {/* Main Grid: List + Side Detail */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Workers List Grid */}
        <div className="lg:col-span-2 space-y-3">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
            </div>
          ) : workers.length === 0 ? (
            <Card className="p-8 text-center text-slate-500">
              No workers matched your filters.
            </Card>
          ) : (
            workers.map((w) => (
              <div
                key={w.id}
                onClick={() => showWorkerDetail(w.id)}
                className={`glass-panel flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl cursor-pointer hover:border-blue-300 dark:hover:border-blue-800 transition-all gap-4
                  ${detailWorker && detailWorker.id === w.id ? "border-blue-500 dark:border-blue-600 bg-blue-50/10" : ""}
                `}
              >
                <div className="flex items-center gap-3.5">
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-800">
                    {w.photo ? (
                      <img
                        src={w.photo}
                        alt={w.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User size={20} className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                      {w.name}
                      <span className="text-[10px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {w.id}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {w.designation} •{" "}
                      <span className="font-medium text-slate-600 dark:text-slate-300">
                        {w.department}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <Badge status={w.status} />

                  {hasRole(["Admin", "HR", "Supervisor"]) && (
                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleOpenEdit(w)}
                        className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400"
                        title="Edit Profile"
                      >
                        <Edit size={15} />
                      </button>
                      {hasRole(["Admin", "HR", "Supervisor"]) && (
                        <button
                          onClick={() => handleDelete(w.id)}
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          title="Delete Worker"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Worker Details Sidebar */}
        <div className="lg:col-span-1">
          {detailWorker ? (
            <Card className="sticky top-20 p-5 space-y-5">
              <div className="flex items-start justify-between">
                <h3 className="font-bold text-sm text-slate-500 uppercase tracking-wider">
                  Worker Profile
                </h3>
                <button
                  onClick={() => setDetailWorker(null)}
                  className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Top Photo & Status */}
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border-2 border-blue-500/50">
                  {detailWorker.photo ? (
                    <img
                      src={detailWorker.photo}
                      alt={detailWorker.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={40} className="text-slate-400" />
                  )}
                </div>
                <h2 className="mt-3 text-lg font-bold text-slate-850 dark:text-white">
                  {detailWorker.name}
                </h2>
                <p className="text-xs text-slate-500">
                  {detailWorker.designation} ({detailWorker.id})
                </p>
                <div className="mt-2.5">
                  <Badge status={detailWorker.status} />
                </div>
              </div>

              {/* Fields */}
              <div className="space-y-3.5 border-t border-b border-slate-200/50 py-4 dark:border-slate-850 text-xs">
                <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                  <Briefcase size={14} className="text-slate-400 shrink-0" />
                  <span>
                    Dept:{" "}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {detailWorker.department}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                  <Phone size={14} className="text-slate-400 shrink-0" />
                  <span>
                    Phone:{" "}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {detailWorker.phone}
                    </strong>
                  </span>
                </div>
                {detailWorker.email && (
                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                    <Mail size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">
                      Email:{" "}
                      <strong className="text-slate-800 dark:text-slate-200">
                        {detailWorker.email}
                      </strong>
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <span>
                    Address:{" "}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {detailWorker.address || "N/A"}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                  <Calendar size={14} className="text-slate-400 shrink-0" />
                  <span>
                    Joined:{" "}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {detailWorker.dateOfJoining}
                    </strong>
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                  <Clock size={14} className="text-slate-400 shrink-0" />
                  <span>
                    Shift:{" "}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {detailWorker.shiftTiming}
                    </strong>
                  </span>
                </div>
                {hasRole(["Admin", "HR"]) && (
                  <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                    <DollarSign size={14} className="text-slate-400 shrink-0" />
                    <span>
                      Salary:{" "}
                      <strong className="text-slate-800 dark:text-slate-200">
                        ${detailWorker.salary?.toLocaleString()}
                      </strong>
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                  <Star
                    size={14}
                    className="text-amber-400 shrink-0 fill-amber-400"
                  />
                  <span>
                    Rating:{" "}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {detailWorker.performanceRating} / 5.0
                    </strong>
                  </span>
                </div>
              </div>

              {/* Emergency Contact */}
              {detailWorker.emergencyContact?.name && (
                <div className="rounded-xl bg-orange-50/50 p-3 dark:bg-orange-950/10 text-xs">
                  <h4 className="font-semibold text-orange-800 dark:text-orange-400 flex items-center gap-1.5">
                    <ShieldAlert size={14} />
                    Emergency Contact
                  </h4>
                  <div className="mt-2 text-slate-600 dark:text-slate-300">
                    <p className="font-semibold">
                      {detailWorker.emergencyContact.name} (
                      {detailWorker.emergencyContact.relation})
                    </p>
                    <p className="mt-0.5">
                      {detailWorker.emergencyContact.phone}
                    </p>
                  </div>
                </div>
              )}

              {/* Documents List */}
              {detailWorker.documents?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-xs text-slate-700 dark:text-slate-350">
                    Verified Documents
                  </h4>
                  <div className="mt-1.5 space-y-1 text-xs">
                    {detailWorker.documents.map((doc, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-blue-600 dark:text-blue-450 font-medium"
                      >
                        <FileText size={13} />
                        <span className="hover:underline cursor-pointer">
                          {doc}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Attendance History */}
              {detailWorker.attendanceHistory?.length > 0 && (
                <div>
                  <h4 className="font-semibold text-xs text-slate-700 dark:text-slate-350">
                    Recent History
                  </h4>
                  <div className="mt-2 space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {detailWorker.attendanceHistory.slice(0, 5).map((att) => (
                      <div
                        key={att.id}
                        className="flex items-center justify-between text-[11px] border-b border-slate-100 pb-1.5 last:border-b-0 dark:border-slate-850"
                      >
                        <span className="text-slate-500 font-medium">
                          {att.date}
                        </span>
                        <div className="flex gap-1.5">
                          <span className="text-slate-400">
                            {att.checkIn} - {att.checkOut}
                          </span>
                          <Badge status={att.status} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Profile Actions */}
              {hasRole(["Admin", "HR", "Supervisor"]) && (
                <div className="flex gap-3 pt-4 border-t border-slate-200/50 dark:border-slate-805">
                  <button
                    onClick={() => handleOpenEdit(detailWorker)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-650 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350"
                  >
                    <Edit size={14} />
                    Edit Details
                  </button>
                  {hasRole(["Admin", "HR", "Supervisor"]) && (
                    <button
                      onClick={() => handleDelete(detailWorker.id)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 transition-all"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </Card>
          ) : (
            <Card className="p-8 text-center text-slate-400 h-64 flex flex-col justify-center">
              Select a worker from the list to view profile, documents, and
              attendance history.
            </Card>
          )}
        </div>
      </div>

      {/* Add / Edit Profile Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-850">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {editWorkerId ? "Edit Profile" : "Add Worker Record"}
              </h3>
              <button
                onClick={() => {
                  stopCamera();
                  setModalOpen(false);
                }}
                className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              {/* Form Grid */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Name */}
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>

                {/* Department */}
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Department *
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950"
                  >
                    {departmentsList.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Designation */}
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. CNC Operator"
                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>

                {/* Shift Timing */}
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Shift Timing
                  </label>
                  <select
                    value={shiftTiming}
                    onChange={(e) => setShiftTiming(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950"
                  >
                    <option value="08:00 AM - 04:00 PM">
                      08:00 AM - 04:00 PM (Day Shift)
                    </option>
                    <option value="04:00 PM - 12:00 AM">
                      04:00 PM - 12:00 AM (Evening Shift)
                    </option>
                    <option value="12:00 AM - 08:00 AM">
                      12:00 AM - 08:00 AM (Night Shift)
                    </option>
                  </select>
                </div>

                {/* Salary */}
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Salary ($ / Month)
                  </label>
                  <input
                    type="number"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 dark:border-slate-800 dark:bg-slate-950 disabled:opacity-50"
                  />
                </div>

                {/* Date of Joining */}
                <div>
                  <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Date of Joining
                  </label>
                  <input
                    type="date"
                    value={dateOfJoining}
                    onChange={(e) => setDateOfJoining(e.target.value)}
                    className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 dark:border-slate-800 dark:bg-slate-950"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Residential Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 dark:border-slate-800 dark:bg-slate-950"
                />
              </div>

              {/* Photo Upload & Camera Section */}
              <div className="border-t border-slate-100 pt-3.5 dark:border-slate-850">
                <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Worker Photo
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
                  <div className="h-20 w-20 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-800">
                    {photo ? (
                      <img
                        src={photo}
                        alt="Preview"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User size={30} className="text-slate-450" />
                    )}
                  </div>

                  <div className="flex-1 w-full space-y-2">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={startCamera}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-650 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350"
                      >
                        <Camera size={14} />
                        Simulate Snap
                      </button>
                      {photo && (
                        <button
                          type="button"
                          onClick={() => setPhoto("")}
                          className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 dark:bg-rose-950/20"
                        >
                          Clear
                        </button>
                      )}
                    </div>

                    {cameraActive && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-center dark:border-slate-800 dark:bg-slate-950">
                        <div className="aspect-video w-48 rounded bg-black mx-auto overflow-hidden">
                          <video
                            ref={videoRef}
                            className="h-full w-full object-cover scale-x-[-1]"
                          />
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                        <button
                          type="button"
                          onClick={capturePhoto}
                          className="mt-2 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-750"
                        >
                          Capture Snapshot
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-t border-slate-100 pt-3.5 dark:border-slate-850">
                <h4 className="font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Emergency Contact Information
                </h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-slate-450 mb-1">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-450 mb-1">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      placeholder="e.g. Spouse, Father"
                      className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-450 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200/80 bg-slate-50 px-3.5 py-2.5 text-xs outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-850">
                <button
                  type="button"
                  onClick={() => {
                    stopCamera();
                    setModalOpen(false);
                  }}
                  className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-350"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-750"
                >
                  Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
