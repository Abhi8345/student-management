import { useEffect, useState } from "react";
import axios from "axios";
import {
  ArrowDownUp,
  BookOpen,
  Check,
  ChevronDown,
  GraduationCap,
  LayoutDashboard,
  LoaderCircle,
  Mail,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from "lucide-react";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

const emptyForm = { name: "", email: "", course: "", age: "" };
const commonCourses = ["BTech", "MBA", "MCA", "BCA", "BBA", "MTech", "MSc", "BSc", "MCom", "BCom", "MA", "BA"];

function initials(name = "") {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function App() {
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");
  const [courseFilter, setCourseFilter] = useState("All courses");
  const [sortOrder, setSortOrder] = useState("asc");
  const [modalOpen, setModalOpen] = useState(false);
  const [profileStudent, setProfileStudent] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadStudents() {
    setLoading(true);
    setError("");
    try {
      const response = await api.get("/students");
      setStudents(response.data);
    } catch {
      setError("Could not reach the student API. Check that the backend and MongoDB are running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (!notice) return undefined;
    const timeout = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  const courses = [...new Set(students.map((student) => student.course))].sort();
  const filteredStudents = students
    .filter((student) => {
      const searchText = `${student.name} ${student.email} ${student.course}`.toLowerCase();
      return searchText.includes(query.toLowerCase());
    })
    .filter((student) => courseFilter === "All courses" || student.course === courseFilter)
    .sort((left, right) =>
      sortOrder === "asc"
        ? left.name.localeCompare(right.name)
        : right.name.localeCompare(left.name),
    );

  function openCreateModal() {
    setEditingStudent(null);
    setForm(emptyForm);
    setError("");
    setModalOpen(true);
  }

  function openEditModal(student) {
    setProfileStudent(null);
    setEditingStudent(student);
    setForm({
      name: student.name,
      email: student.email,
      course: student.course,
      age: String(student.age),
    });
    setError("");
    setModalOpen(true);
  }

  async function saveStudent(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const studentData = { ...form, age: Number(form.age) };

    try {
      if (editingStudent) {
        await api.put(`/students/${editingStudent._id}`, studentData);
        setNotice("Student details updated");
      } else {
        await api.post("/students", studentData);
        setNotice("Student added to the roster");
      }
      setModalOpen(false);
      await loadStudents();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to save student details");
    } finally {
      setSaving(false);
    }
  }

  async function deleteStudent(student) {
    if (!window.confirm(`Remove ${student.name} from the student roster?`)) return;

    try {
      await api.delete(`/students/${student._id}`);
      setStudents((current) => current.filter((item) => item._id !== student._id));
      setNotice("Student removed from the roster");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete this student");
    }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#main" aria-label="Student Desk home">
          <span className="brand-mark"><GraduationCap size={22} strokeWidth={2.2} /></span>
          <span>student<span className="brand-light">desk</span></span>
        </a>

        <div className="side-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-item nav-item-active" href="#main">
            <LayoutDashboard size={18} />
            <span>Overview</span>
          </a>
          <a className="nav-item" href="#roster">
            <Users size={18} />
            <span>Students</span>
            <span className="nav-count">{students.length}</span>
          </a>
          <a className="nav-item" href="#roster">
            <BookOpen size={18} />
            <span>Courses</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-rule" />
          <div className="workspace-label">CURRENT WORKSPACE</div>
          <div className="workspace-row">
            <div className="workspace-avatar">C</div>
            <div className="workspace-copy"><strong>College Admin</strong><span>Administrator</span></div>
            <ChevronDown size={15} />
          </div>
        </div>
      </aside>

      <main className="main-content" id="main">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> <strong>Overview</strong></div>
          <div className="topbar-right"><span className="status-dot" /> Academic year 2025–26</div>
        </header>

        <section className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">STUDENT DIRECTORY</div>
              <h1>Good morning, Admin <span className="heading-spark">✳</span></h1>
              <p className="page-subtitle">Keep your student records organized and up to date.</p>
            </div>
            <button className="button button-primary" onClick={openCreateModal}>
              <Plus size={17} /> Add student
            </button>
          </div>

          <section className="stats-grid" aria-label="Student summary">
            <article className="stat-panel stat-panel-green">
              <div className="stat-top"><span>Total students</span><span className="stat-icon"><Users size={17} /></span></div>
              <div className="stat-value">{students.length.toLocaleString()}</div>
              <div className="stat-foot"><span className="stat-indicator"><Check size={12} /></span> Student records in directory</div>
            </article>
            <article className="stat-panel">
              <div className="stat-top"><span>Active courses</span><span className="stat-icon stat-icon-blue"><BookOpen size={17} /></span></div>
              <div className="stat-value">{courses.length.toString().padStart(2, "0")}</div>
              <div className="stat-foot">Distinct courses represented</div>
            </article>
            <article className="stat-panel">
              <div className="stat-top"><span>Average age</span><span className="stat-icon stat-icon-coral"><GraduationCap size={17} /></span></div>
              <div className="stat-value">{students.length
                ? (students.reduce((total, student) => total + student.age, 0) / students.length).toFixed(1)
                : "—"}<span className="stat-unit"> yrs</span></div>
              <div className="stat-foot">Across all enrolled students</div>
            </article>
          </section>

          <section className="roster-section" id="roster">
            <div className="roster-heading">
              <div>
                <h2>Student roster <span className="roster-count">{students.length}</span></h2>
                <p>Manage student profiles and course assignments.</p>
              </div>
              <button className="button button-outline" onClick={openCreateModal}><Plus size={16} /> New student</button>
            </div>

            <div className="table-toolbar">
              <label className="search-box">
                <Search size={17} />
                <input
                  type="search"
                  placeholder="Search by name, email, or course..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  aria-label="Search students"
                />
                <kbd>⌘ K</kbd>
              </label>
              <div className="toolbar-actions">
                <label className="filter-control">
                  <select value={courseFilter} onChange={(event) => setCourseFilter(event.target.value)} aria-label="Filter by course">
                    <option>All courses</option>
                    {courses.map((course) => <option key={course}>{course}</option>)}
                  </select>
                  <ChevronDown size={15} />
                </label>
                <button
                  className="icon-button sort-button"
                  onClick={() => setSortOrder((current) => current === "asc" ? "desc" : "asc")}
                  aria-label={`Sort names ${sortOrder === "asc" ? "descending" : "ascending"}`}
                  title={`Sort ${sortOrder === "asc" ? "Z to A" : "A to Z"}`}
                ><ArrowDownUp size={16} /></button>
              </div>
            </div>

            {error && !modalOpen && <div className="inline-alert" role="alert">{error}</div>}

            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>STUDENT</th><th>EMAIL ADDRESS</th><th>COURSE</th><th>AGE</th><th><span className="sr-only">Actions</span></th></tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td className="table-state" colSpan="5"><LoaderCircle className="spinner" size={21} /> Loading student records...</td></tr>
                  ) : filteredStudents.length ? filteredStudents.map((student, index) => (
                    <tr key={student._id}>
                      <td>
                        <div className="student-cell">
                          <div className={`student-avatar avatar-${index % 5}`}>{initials(student.name)}</div>
                          <button className="student-name student-name-button" onClick={() => setProfileStudent(student)}>{student.name}</button>
                        </div>
                      </td>
                      <td><span className="email-cell"><Mail size={14} /> {student.email}</span></td>
                      <td><span className="course-tag">{student.course}</span></td>
                      <td><span className="age-cell">{student.age} <span>years</span></span></td>
                      <td>
                        <div className="row-actions">
                          <button className="icon-button" onClick={() => openEditModal(student)} aria-label={`Edit ${student.name}`} title="Edit student"><Pencil size={15} /></button>
                          <button className="icon-button icon-button-danger" onClick={() => deleteStudent(student)} aria-label={`Delete ${student.name}`} title="Delete student"><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td className="table-state empty-state" colSpan="5">
                      <div className="empty-mark"><Users size={22} /></div>
                      <strong>{students.length ? "No matching students" : "Your roster is ready"}</strong>
                      <span>{students.length ? "Try a different search or course filter." : "Add a student to start building your directory."}</span>
                      {!students.length && <button className="button button-primary empty-button" onClick={openCreateModal}><Plus size={16} /> Add first student</button>}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="table-footer">
              <span>Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> students</span>
              <span className="sync-label"><span className="status-dot" /> Synced with database</span>
            </div>
          </section>

          <footer className="page-footer"><span>STUDENT DESK</span><span>Thoughtful records. Better learning.</span></footer>
        </section>
      </main>

      {profileStudent && !modalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setProfileStudent(null);
        }}>
          <section className="student-modal student-detail-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title">
            <div className="modal-heading">
              <div><div className="eyebrow">STUDENT RECORD</div><h2 id="profile-title">Student information</h2></div>
              <button className="icon-button" onClick={() => setProfileStudent(null)} aria-label="Close student information"><X size={19} /></button>
            </div>
            <div className="profile-identity">
              <div className="profile-avatar">{initials(profileStudent.name)}</div>
              <div><strong>{profileStudent.name}</strong><span>{profileStudent.course}</span></div>
            </div>
            <dl className="profile-details">
              <div><dt>Email address</dt><dd>{profileStudent.email}</dd></div>
              <div><dt>Course</dt><dd>{profileStudent.course}</dd></div>
              <div><dt>Age</dt><dd>{profileStudent.age} years</dd></div>
              <div><dt>Student ID</dt><dd className="profile-id">{profileStudent._id}</dd></div>
              <div><dt>Record created</dt><dd>{formatDate(profileStudent.createdAt)}</dd></div>
              <div><dt>Last updated</dt><dd>{formatDate(profileStudent.updatedAt)}</dd></div>
            </dl>
            <div className="modal-actions profile-actions">
              <button className="button button-cancel" onClick={() => setProfileStudent(null)}>Close</button>
              <button className="button button-primary" onClick={() => openEditModal(profileStudent)}><Pencil size={15} /> Edit student</button>
            </div>
          </section>
        </div>
      )}

      {modalOpen && (
        <div className="modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !saving) setModalOpen(false);
        }}>
          <section className="student-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="modal-heading">
              <div><div className="eyebrow">STUDENT PROFILE</div><h2 id="modal-title">{editingStudent ? "Edit student" : "Add a student"}</h2></div>
              <button className="icon-button" onClick={() => setModalOpen(false)} disabled={saving} aria-label="Close dialog"><X size={19} /></button>
            </div>
            <p className="modal-intro">{editingStudent ? "Update the student's information below." : "Enter the details to add a new student to your directory."}</p>
            <form onSubmit={saveStudent}>
              <label className="form-field">Full name<input required maxLength="100" autoFocus placeholder="e.g. Rahul Sharma" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
              <label className="form-field">Email address<input required type="email" placeholder="name@college.edu" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
              <div className="form-row">
                <label className="form-field">Course<select className="course-select" required value={form.course} onChange={(event) => setForm({ ...form, course: event.target.value })}><option value="" disabled>Select a course</option>{[...new Set([...commonCourses, ...(form.course && !commonCourses.includes(form.course) ? [form.course] : [])])].map((course) => <option key={course} value={course}>{course}</option>)}</select></label>
                <label className="form-field">Age<input required type="number" min="1" max="120" step="1" placeholder="22" value={form.age} onChange={(event) => setForm({ ...form, age: event.target.value })} /></label>
              </div>
              {error && <div className="form-error" role="alert">{error}</div>}
              <div className="modal-actions">
                <button className="button button-cancel" type="button" onClick={() => setModalOpen(false)} disabled={saving}>Cancel</button>
                <button className="button button-primary" type="submit" disabled={saving}>
                  {saving ? <LoaderCircle className="spinner" size={16} /> : <Check size={16} />}
                  {saving ? "Saving..." : editingStudent ? "Save changes" : "Add student"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {notice && <div className="toast" role="status"><span className="toast-check"><Check size={14} /></span>{notice}</div>}
    </div>
  );
}

export default App;