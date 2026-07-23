import React, { useState, useEffect, useRef } from "react";
import {
  Calendar as CalendarIcon,
  QrCode,
  ScanLine,
  FileSpreadsheet,
  Clock,
  Camera,
  Search,
  UserCheck,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { useLanguage } from "../context/LanguageContext";
import { api } from "../services/api";

export const AttendanceManagement = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("sheet");
  const [workers, setWorkers] = useState([]);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  // Loading states
  const [loading, setLoading] = useState(false);
  const [markingId, setMarkingId] = useState(null);

  // QR Simulator state
  const [selectedQRWorker, setSelectedQRWorker] = useState("");
  const [qrLog, setQrLog] = useState([]);
  const [scanningQR, setScanningQR] = useState(false);

  // Face Simulator state
  const [selectedFaceWorker, setSelectedFaceWorker] = useState("");
  const [faceLog, setFaceLog] = useState([]);
  const [scanningFace, setScanningFace] = useState(false);
  const [faceStreamActive, setFaceStreamActive] = useState(false);
  // Ref for simulators
  const cameraVideoRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [attendanceDate, searchQuery]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const workersData = await api.workers.getAll({ search: searchQuery });
      const attData = await api.attendance.get({ date: attendanceDate });
      setWorkers(workersData);
      setAttendanceRecords(attData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getRecord = (workerId) => {
    return attendanceRecords.find((r) => r.workerId === workerId);
  };

  const handleMarkStatus = async (workerId, status) => {
    setMarkingId(workerId);
    const existing = getRecord(workerId);
    // Pick default checkIn/Out times based on status
    let checkIn = "--:--";
    let checkOut = "--:--";
    if (
      status === "Present" ||
      status === "Overtime" ||
      status === "Late Entry" ||
      status === "Half Day"
    ) {
      checkIn = "08:00 AM";
      checkOut = "04:00 PM";
    }

    try {
      const updated = await api.attendance.mark({
        workerId,
        date: attendanceDate,
        status,
        checkIn,
        checkOut: status === "Overtime" ? "06:00 PM" : checkOut,
        overtimeHours: status === "Overtime" ? 2 : 0,
        comments: existing?.comments || "",
      });

      // Update local state list
      setAttendanceRecords((prev) => {
        const idx = prev.findIndex((r) => r.workerId === workerId);
        if (idx !== -1) {
          const list = [...prev];
          list[idx] = updated;
          return list;
        } else {
          return [...prev, updated];
        }
      });
    } catch (err) {
      alert(err.message || "Marking failed");
    } finally {
      setMarkingId(null);
    }
  };

  // QR Code Simulator handlers
  const handleSimulateQR = async () => {
    if (!selectedQRWorker) return;
    setScanningQR(true);
    setQrLog((prev) => [
      `[${new Date().toLocaleTimeString()}] Scanning QR badge...`,
      ...prev,
    ]);
    setTimeout(async () => {
      try {
        const res = await api.attendance.scanQR(selectedQRWorker);
        const workerName =
          workers.find((w) => w.id === selectedQRWorker)?.name ||
          selectedQRWorker;
        setQrLog((prev) => [
          `[${new Date().toLocaleTimeString()}] SUCCESS: ${res.message} for ${workerName}.`,
          ...prev,
        ]);
        fetchData(); // reload
      } catch (err) {
        setQrLog((prev) => [
          `[${new Date().toLocaleTimeString()}] ERROR: ${err.message}`,
          ...prev,
        ]);
      } finally {
        setScanningQR(false);
      }
    }, 1500);
  };

  // Face Scanner Simulator handlers
  const startFaceCamera = async () => {
    setFaceStreamActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 },
      });
      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        cameraVideoRef.current.play();
      }
    } catch (e) {
      console.log(
        "biometrics simulation running without physical webcam stream.",
      );
    }
  };

  const stopFaceCamera = () => {
    if (cameraVideoRef.current && cameraVideoRef.current.srcObject) {
      const stream = cameraVideoRef.current.srcObject;
      stream.getTracks().forEach((t) => t.stop());
      cameraVideoRef.current.srcObject = null;
    }
    setFaceStreamActive(false);
  };

  const handleSimulateFace = async () => {
    if (!selectedFaceWorker) return;
    setScanningFace(true);
    setFaceLog((prev) => [
      `[${new Date().toLocaleTimeString()}] Accessing camera feed...`,
      `[${new Date().toLocaleTimeString()}] Mapping facial contours & mesh...`,
      ...prev,
    ]);

    setTimeout(async () => {
      try {
        const confidence = Math.floor(Math.random() * 8) + 92; // 92% - 99%
        const res = await api.attendance.scanFace(
          selectedFaceWorker,
          confidence,
        );
        const workerName =
          workers.find((w) => w.id === selectedFaceWorker)?.name ||
          selectedFaceWorker;
        setFaceLog((prev) => [
          `[${new Date().toLocaleTimeString()}] MATCH FOUND: ${workerName} with ${confidence}% accuracy.`,
          `[${new Date().toLocaleTimeString()}] SUCCESS: ${res.message}.`,
          ...prev,
        ]);
        fetchData();
      } catch (err) {
        setFaceLog((prev) => [
          `[${new Date().toLocaleTimeString()}] Biometric match failed: ${err.message}`,
          ...prev,
        ]);
      } finally {
        setScanningFace(false);
        stopFaceCamera();
      }
    }, 2500);
  };

  // Simple monthly calendar data helper
  const getCalendarDays = () => {
    const days = [];
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Empty spaces before first day
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    // Days in month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const monthName = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t("attendance")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Log shifts, track entries, and simulate QR/Face biometrics.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-sm">
        <button
          onClick={() => {
            stopFaceCamera();
            setActiveTab("sheet");
          }}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-semibold transition-colors
            ${
              activeTab === "sheet"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
        >
          <FileSpreadsheet size={16} />
          Daily Entry Sheet
        </button>
        <button
          onClick={() => {
            stopFaceCamera();
            setActiveTab("calendar");
          }}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-semibold transition-colors
            ${
              activeTab === "calendar"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
        >
          <CalendarIcon size={16} />
          Attendance Calendar
        </button>
        <button
          onClick={() => {
            stopFaceCamera();
            setActiveTab("qr");
          }}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-semibold transition-colors
            ${
              activeTab === "qr"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
        >
          <QrCode size={16} />
          QR Scanner Mock
        </button>
        <button
          onClick={() => {
            startFaceCamera();
            setActiveTab("face");
          }}
          className={`flex items-center gap-2 border-b-2 px-4 py-2.5 font-semibold transition-colors
            ${
              activeTab === "face"
                ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
        >
          <ScanLine size={16} />
          Face Match Mock
        </button>
      </div>

      {/* Tab Contents: 1. DAILY SHEET */}
      {activeTab === "sheet" && (
        <div className="space-y-4">
          <Card className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <CalendarIcon size={18} className="text-blue-500" />
              <span className="text-sm font-semibold text-slate-755">
                Select Working Date:
              </span>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2 text-xs font-semibold outline-none focus:border-blue-500 dark:border-slate-800 dark:bg-slate-950"
              />
            </div>

            <div className="relative w-full md:w-64">
              <Search
                size={16}
                className="absolute inset-y-0 left-3 top-2.5 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search workers to log..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-1.5 text-xs outline-none focus:bg-white dark:focus:bg-slate-900 dark:border-slate-800 dark:bg-slate-950"
              />
            </div>
          </Card>

          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 dark:border-slate-800 dark:bg-slate-900/50 font-bold uppercase tracking-wider">
                    <th className="px-6 py-4">Worker details</th>
                    <th className="px-6 py-4">Department</th>
                    <th className="px-6 py-4">Logged Status</th>
                    <th className="px-6 py-4">Entry / Exit</th>
                    <th className="px-6 py-4 text-center">Batch actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8">
                        <div className="h-6 w-6 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto" />
                      </td>
                    </tr>
                  ) : workers.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-8 text-slate-500"
                      >
                        No workers available.
                      </td>
                    </tr>
                  ) : (
                    workers.map((w) => {
                      const record = getRecord(w.id);
                      return (
                        <tr key={w.id} className="hover:bg-slate-50/20">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-slate-800 dark:text-white block">
                                {w.name}
                              </span>
                              <span className="text-[10px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                                {w.id}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-450 block mt-0.5">
                              {w.designation}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-700 dark:text-slate-350">
                            {w.department}
                          </td>
                          <td className="px-6 py-4">
                            {record ? (
                              <Badge status={record.status} />
                            ) : (
                              <span className="text-slate-400 font-medium">
                                Unmarked
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-500">
                            {record ? (
                              <div className="flex items-center gap-1">
                                <Clock
                                  size={12}
                                  className="text-slate-400 shrink-0"
                                />
                                <span>
                                  {record.checkIn} - {record.checkOut}
                                </span>
                              </div>
                            ) : (
                              "--:--"
                            )}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex justify-center gap-1.5">
                              {[
                                "Present",
                                "Absent",
                                "Half Day",
                                "Leave",
                                "Overtime",
                                "Late Entry",
                              ].map((st) => (
                                <button
                                  key={st}
                                  onClick={() => handleMarkStatus(w.id, st)}
                                  disabled={markingId === w.id}
                                  className={`rounded-lg px-2.5 py-1 text-[10px] font-bold border transition-all duration-150
                                    ${
                                      record?.status === st
                                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400"
                                    }`}
                                >
                                  {st.split(" ")[0]}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Tab Contents: 2. ATTENDANCE CALENDAR */}
      {activeTab === "calendar" && (
        <Card className="max-w-xl mx-auto p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 dark:border-slate-850">
            <h3 className="font-bold text-base text-slate-800 dark:text-white">
              {monthName} Overview
            </h3>
            <span className="text-xs font-semibold text-slate-450">
              Workforce Attendance Stats
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 mb-2">
            <div>Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div>Sat</div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {getCalendarDays().map((day, idx) => (
              <div
                key={idx}
                className={`aspect-square rounded-xl flex flex-col justify-between p-1.5 border text-xs
                  ${
                    day
                      ? "bg-slate-50/50 border-slate-200/50 hover:bg-slate-100 dark:bg-slate-900/40 dark:border-slate-805"
                      : "border-transparent bg-transparent"
                  }`}
              >
                {day && (
                  <>
                    <span className="font-bold text-slate-400 self-start">
                      {day}
                    </span>
                    {/* Simulated indicators of high attendance */}
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-505 bg-emerald-500 self-center" />
                    <span className="text-[9px] font-bold text-emerald-600 self-end">
                      90%
                    </span>
                  </>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Tab Contents: 3. QR CODE SCANNER */}
      {activeTab === "qr" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Scanner Simulator Frame */}
          <Card className="flex flex-col justify-between items-center p-6 text-center">
            <div>
              <h3 className="font-bold text-slate-850 dark:text-white">
                QR Attendance Check-in Simulator
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Select a worker and click simulate to trigger a QR code scan.
                This will automatically toggle check-in / check-out status.
              </p>
            </div>

            {/* Simulated camera view */}
            <div className="relative h-56 w-56 my-6 rounded-2xl border-2 border-dashed border-blue-500 bg-slate-950 flex items-center justify-center overflow-hidden">
              {scanningQR ? (
                <>
                  <div className="absolute top-0 inset-x-0 h-0.5 bg-blue-500 animate-[bounce_2s_infinite]" />
                  <QrCode size={48} className="text-blue-500 animate-pulse" />
                </>
              ) : (
                <QrCode size={48} className="text-slate-700" />
              )}
              {/* Corner guides */}
              <span className="absolute top-2 left-2 border-t-2 border-l-2 border-blue-500 h-4 w-4 rounded-tl" />
              <span className="absolute top-2 right-2 border-t-2 border-r-2 border-blue-500 h-4 w-4 rounded-tr" />
              <span className="absolute bottom-2 left-2 border-b-2 border-l-2 border-blue-500 h-4 w-4 rounded-bl" />
              <span className="absolute bottom-2 right-2 border-b-2 border-r-2 border-blue-500 h-4 w-4 rounded-br" />
            </div>

            {/* Inputs */}
            <div className="w-full max-w-sm space-y-3.5">
              <select
                value={selectedQRWorker}
                onChange={(e) => setSelectedQRWorker(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-blue-500 dark:border-slate-805 dark:bg-slate-950"
              >
                <option value="">Choose Worker Badge to Scan...</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.id})
                  </option>
                ))}
              </select>

              <button
                onClick={handleSimulateQR}
                disabled={!selectedQRWorker || scanningQR}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-semibold text-white shadow-md hover:bg-blue-750 disabled:opacity-50"
              >
                <QrCode size={16} />
                {scanningQR ? "Scanning Code..." : "Simulate Badge Scan"}
              </button>
            </div>
          </Card>

          {/* Scanner Logs */}
          <Card className="flex flex-col justify-between h-96 md:h-auto">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3 dark:border-slate-850">
              Scan Activity Logs
            </h3>
            <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1 font-mono text-[10px] text-slate-600 dark:text-slate-400">
              {qrLog.length === 0 ? (
                <div className="text-center py-10 text-slate-450">
                  Waiting for check-in scans...
                </div>
              ) : (
                qrLog.map((log, idx) => (
                  <div
                    key={idx}
                    className="border-b border-slate-50 pb-1 last:border-b-0 dark:border-slate-850"
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Tab Contents: 4. FACE RECOGNITION */}
      {activeTab === "face" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Biometrics Camera view */}
          <Card className="flex flex-col justify-between items-center p-6 text-center">
            <div>
              <h3 className="font-bold text-slate-850 dark:text-white">
                Face Recognition Biometrics Simulator
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Checks facial vector map against pre-enrolled profiles to log
                check-ins. If physical camera is active, it renders mapping
                details.
              </p>
            </div>

            {/* Video stream box */}
            <div className="relative h-56 w-56 my-6 rounded-2xl bg-black border-2 border-slate-800 flex items-center justify-center overflow-hidden">
              {faceStreamActive ? (
                <video
                  ref={cameraVideoRef}
                  className="h-full w-full object-cover scale-x-[-1]"
                />
              ) : (
                <Camera size={36} className="text-slate-700" />
              )}

              {/* Scanning animations overlay */}
              {scanningFace && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="h-40 w-40 rounded-full border border-blue-500/50 animate-ping absolute" />
                    <span className="h-28 w-28 rounded-full border-2 border-dashed border-blue-400 animate-[spin_5s_linear_infinite]" />
                    <UserCheck
                      size={32}
                      className="text-blue-400 animate-bounce"
                    />
                  </div>
                  <div className="absolute bottom-2 bg-blue-600/90 text-white font-bold text-[9px] px-2 py-0.5 rounded tracking-widest uppercase">
                    Analyzing...
                  </div>
                </>
              )}

              {/* Grid overlay */}
              <div className="absolute inset-0 opacity-15 pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:14px_24px]" />
            </div>

            {/* Inputs */}
            <div className="w-full max-w-sm space-y-3.5">
              <select
                value={selectedFaceWorker}
                onChange={(e) => setSelectedFaceWorker(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-semibold outline-none focus:border-blue-500 dark:border-slate-805 dark:bg-slate-950"
              >
                <option value="">Enroll/Verify Profile...</option>
                {workers.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.id})
                  </option>
                ))}
              </select>

              <button
                onClick={handleSimulateFace}
                disabled={!selectedFaceWorker || scanningFace}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-xs font-semibold text-white hover:bg-blue-750 disabled:opacity-50"
              >
                <ScanLine size={16} />
                {scanningFace
                  ? "Analyzing Biometrics..."
                  : "Identify Face Check-in"}
              </button>
            </div>
          </Card>

          {/* Scanner Logs */}
          <Card className="flex flex-col justify-between h-96 md:h-auto">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-3 dark:border-slate-850">
              Biometric Verification Stream
            </h3>
            <div className="flex-1 overflow-y-auto mt-3 space-y-2 pr-1 font-mono text-[10px] text-slate-600 dark:text-slate-400">
              {faceLog.length === 0 ? (
                <div className="text-center py-10 text-slate-450">
                  Enrolling and checking templates...
                </div>
              ) : (
                faceLog.map((log, idx) => (
                  <div
                    key={idx}
                    className="border-b border-slate-55 pb-1 last:border-b-0 dark:border-slate-850"
                  >
                    {log}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
