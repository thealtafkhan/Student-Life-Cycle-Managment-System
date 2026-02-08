import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { toast } from "sonner";
import api from "../utils/api";
import { Edit, Trash2 } from "lucide-react";
import { Label } from "recharts";

export const FacultyManagement = () => {
  const [faculties, setFaculties] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState([]);

  const [isEditing, setIsEditing] = useState(false);
  const [editingFacultyId, setEditingFacultyId] = useState(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    employeeId: "",
    departmentId: "",
    designation: "",
    qualification: "",
    specialization: "",
    experience: "",
  });

  useEffect(() => {
    fetchFaculties();
    fetchDepartments();
    fetchAllSubjects();
  }, []);

  /* ---------------- FETCH ---------------- */

  const fetchFaculties = async () => {
    const res = await api.get("/api/faculty");
    setFaculties(res.data);
  };

  const fetchDepartments = async () => {
    const res = await api.get("/api/departments");
    setDepartments(res.data);
  };

  const fetchAllSubjects = async () => {
    const coursesRes = await api.get("/api/courses");
    const all = [];

    for (const c of coursesRes.data) {
      const subRes = await api.get(`/api/courses/${c._id}/subjects`);
      all.push(...subRes.data.map((s) => ({ ...s, courseName: c.name })));
    }
    setSubjects(all);
  };

  /* ---------------- CREATE ---------------- */

  const createFaculty = async () => {
    if (!formData.departmentId) {
      toast.error("Please select a department");
      return;
    }

    const res = await api.post("/api/faculty", formData);

    const facultyId = res.data?.faculty?._id;
    if (!facultyId) throw new Error("Faculty ID missing");

    if (selectedSubjects.length > 0) {
      await api.post(`/api/faculty/${facultyId}/assign-subjects`, {
        subjectIds: selectedSubjects,
      });
    }
  };

  /* ---------------- UPDATE ---------------- */

  const updateFaculty = async () => {
    const { password, ...updateData } = formData;

    await api.put(`/api/faculty/${editingFacultyId}`, updateData);

    await api.post(`/api/faculty/${editingFacultyId}/assign-subjects`, {
      subjectIds: selectedSubjects,
    });
  };

  /* ---------------- DELETE ---------------- */

  const deleteFaculty = async (id) => {
    if (!window.confirm("Delete this faculty?")) return;

    try {
      const res = await api.delete(`/api/faculty/${id}`);
      toast.success(res.data?.message || "Faculty deleted");

      setFaculties((prev) => prev.filter((f) => f._id !== id));
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Delete failed",
      );
    }
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      isEditing ? await updateFaculty() : await createFaculty();

      await fetchFaculties();
      resetForm();

      toast.success(isEditing ? "Faculty updated" : "Faculty created");
    } catch (err) {
      console.log(err);
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Operation failed",
      );
    }
  };

  /* ---------------- EDIT ---------------- */

  const handleEdit = (f) => {
    setShowForm(true);
    setIsEditing(true);
    setEditingFacultyId(f._id);

    setFormData({
      email: f.userId?.email || "",
      password: "",
      fullName: f.userId?.fullName || "",
      phone: f.userId?.phone || "",
      employeeId: f.employeeId || "",
      departmentId: f.departmentId?._id || "",
      designation: f.designation || "",
      qualification: f.qualification || "",
      specialization: f.specialization || "",
      experience: f.experience || "",
    });

    setSelectedSubjects(f.assignedSubjects?.map((s) => s._id) || []);
  };

  /* ---------------- HELPERS ---------------- */

  const toggleSubject = (id) => {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const resetForm = () => {
    setShowForm(false);
    setIsEditing(false);
    setEditingFacultyId(null);
    setSelectedSubjects([]);
    setFormData({
      email: "",
      password: "",
      fullName: "",
      phone: "",
      employeeId: "",
      departmentId: "",
      designation: "",
      qualification: "",
      specialization: "",
      experience: "",
    });
  };

  /* ---------------- UI ---------------- */

  return (
    <div>
      <div className="flex justify-between mb-8">
        <h1 className="text-4xl font-bold text-brand-blue">
          Faculty Management
        </h1>
        <Button
          className="bg-brand-blue"
          onClick={() => {
            if (showForm) {
              // Cancel clicked
              resetForm();
            } else {
              // Add Faculty clicked
              resetForm();
              setShowForm(true);
              setIsEditing(false);
            }
          }}
        >
          {showForm ? "Cancel" : "Add Faculty"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              {isEditing ? "Edit Faculty" : "Create Faculty"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  required
                />

                <Input
                  placeholder="Email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />

                <Input
                  placeholder="Phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  required
                />

                {!isEditing && (
                  <Input
                    type="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                )}

                <Input
                  placeholder="Employee ID"
                  value={formData.employeeId}
                  onChange={(e) =>
                    setFormData({ ...formData, employeeId: e.target.value })
                  }
                  required
                />

                <Select
                  value={formData.departmentId || ""}
                  onValueChange={(v) =>
                    setFormData({ ...formData, departmentId: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((d) => (
                      <SelectItem key={d._id} value={d._id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  placeholder="Designation"
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                />

                <Input
                  placeholder="Qualification"
                  value={formData.qualification}
                  onChange={(e) =>
                    setFormData({ ...formData, qualification: e.target.value })
                  }
                />

                <Input
                  placeholder="Specialization"
                  value={formData.specialization}
                  onChange={(e) =>
                    setFormData({ ...formData, specialization: e.target.value })
                  }
                />

                <Input
                  type="number"
                  placeholder="Experience (Years)"
                  value={formData.experience}
                  onChange={(e) =>
                    setFormData({ ...formData, experience: e.target.value })
                  }
                />
              </div>

              {!formData.departmentId && (
                <p className="text-xs text-red-500">Department is required</p>
              )}

              <div className="border p-3 max-h-56 overflow-y-auto">
                {subjects.map((s) => (
                  <label key={s._id} className="flex gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(s._id)}
                      onChange={() => toggleSubject(s._id)}
                    />
                    {s.name} ({s.courseName})
                  </label>
                ))}
              </div>

              <Button type="submit" className="bg-brand-blue">
                {isEditing ? "Update Faculty" : "Create Faculty"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Faculty</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Subjects</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {faculties.map((f) => (
                <TableRow key={f._id}>
                  <TableCell>{f.userId?.fullName}</TableCell>
                  <TableCell>{f.employeeId}</TableCell>
                  <TableCell>{f.departmentId?.name}</TableCell>
                  <TableCell>{f.assignedSubjects?.length || 0}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(f)}
                    >
                      <Edit />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteFaculty(f._id)}
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export const ApplicationManagement = () => {
  const [applications, setApplications] = useState([]);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      const params = filter !== "all" ? { status: filter } : {};
      const response = await api.get("/api/applications", { params });
      setApplications(response.data);
    } catch (error) {
      toast.error("Failed to fetch applications");
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      selected: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      enrolled: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div>
      <h1 className="font-serif text-4xl font-bold text-brand-blue mb-8">
        Application Management
      </h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter Applications</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              className={filter === "all" ? "bg-brand-blue" : ""}
            >
              All
            </Button>
            <Button
              variant={filter === "pending" ? "default" : "outline"}
              onClick={() => setFilter("pending")}
              className={filter === "pending" ? "bg-brand-blue" : ""}
            >
              Pending
            </Button>
            <Button
              variant={filter === "selected" ? "default" : "outline"}
              onClick={() => setFilter("selected")}
              className={filter === "selected" ? "bg-brand-blue" : ""}
            >
              Selected
            </Button>
            <Button
              variant={filter === "rejected" ? "default" : "outline"}
              onClick={() => setFilter("rejected")}
              className={filter === "rejected" ? "bg-brand-blue" : ""}
            >
              Rejected
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Applications ({applications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Percentage</TableHead>
                <TableHead>Merit Rank</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((app) => (
                <TableRow key={app._id}>
                  <TableCell className="font-medium">
                    {app.userId?.fullName}
                  </TableCell>
                  <TableCell>{app.userId?.email}</TableCell>
                  <TableCell>{app.courseId?.name}</TableCell>
                  <TableCell>{app.programType}</TableCell>
                  <TableCell>{app.percentage}%</TableCell>
                  <TableCell>{app.meritRank || "-"}</TableCell>
                  <TableCell>
                    {new Date(app.applicationDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(app.status)}`}
                    >
                      {app.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export const MeritGeneration = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [meritList, setMeritList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMerit, setShowMerit] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get("/api/courses");
      setCourses(response.data);
    } catch (error) {
      toast.error("Failed to fetch courses");
    }
  };

  const handleGenerateMerit = async () => {
    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/api/merit/generate", {
        courseId: selectedCourse,
      });
      toast.success(
        `Merit list generated! ${response.data.selected} students selected out of ${response.data.totalApplications}`,
      );
      setMeritList(response.data.meritList);
      setShowMerit(true);
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Failed to generate merit list",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchMeritList = async () => {
    if (!selectedCourse) return;
    try {
      const response = await api.get("/api/merit", {
        params: { courseId: selectedCourse },
      });
      setMeritList(response.data);
      setShowMerit(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className="font-serif text-4xl font-bold text-brand-blue mb-8">
        Merit List Generation
      </h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Generate Merit List</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Select Course</Label>
            <Select
              onValueChange={(value) => {
                setSelectedCourse(value);
                setShowMerit(false);
              }}
            >
              <SelectTrigger data-testid="merit-course-select">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.name} ({course.code}) - {course.availableSeats}{" "}
                    seats available
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex space-x-4">
            <Button
              onClick={handleGenerateMerit}
              disabled={loading || !selectedCourse}
              className="bg-brand-gold hover:bg-brand-gold/90"
              data-testid="generate-merit-button"
            >
              {loading ? "Generating..." : "Generate Merit List"}
            </Button>
            <Button
              onClick={fetchMeritList}
              disabled={!selectedCourse}
              variant="outline"
              data-testid="view-merit-button"
            >
              View Existing Merit List
            </Button>
          </div>
        </CardContent>
      </Card>

      {showMerit && meritList.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Merit List Results</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Percentage</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {meritList.map((item) => (
                  <TableRow key={item.rank}>
                    <TableCell className="font-bold">
                      {item.rank || item.meritRank}
                    </TableCell>
                    <TableCell>
                      {item.student?.fullName || item.userId?.fullName}
                    </TableCell>
                    <TableCell>
                      {item.student?.email || item.userId?.email}
                    </TableCell>
                    <TableCell>{item.percentage}%</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                          item.status === "selected"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export const EnrollmentManagement = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filterCourse, setFilterCourse] = useState("");

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    fetchEnrollments();
  }, [filterCourse]);

  const fetchEnrollments = async () => {
    try {
      const params = filterCourse ? { courseId: filterCourse } : {};
      const response = await api.get("/api/enrollments", { params });
      setEnrollments(response.data);
    } catch (error) {
      toast.error("Failed to fetch enrollments");
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get("/api/courses");
      setCourses(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h1 className="font-serif text-4xl font-bold text-brand-blue mb-8">
        Enrollment Management
      </h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filter by Course</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Select onValueChange={setFilterCourse} value={filterCourse}>
              <SelectTrigger>
                <SelectValue placeholder="All Courses" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course._id} value={course._id}>
                    {course.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filterCourse && (
              <Button
                variant="outline"
                onClick={() => setFilterCourse("")}
                size="sm"
              >
                Clear Filter
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Enrollments ({enrollments?.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Enrollment No</TableHead>
                <TableHead>Roll No</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((enrollment) => (
                <TableRow key={enrollment._id}>
                  <TableCell className="font-medium">
                    {enrollment.enrollmentNo}
                  </TableCell>
                  <TableCell>{enrollment.rollNo}</TableCell>
                  <TableCell>{enrollment.studentId?.fullName}</TableCell>
                  <TableCell>{enrollment.courseId?.name}</TableCell>
                  <TableCell>{enrollment.currentSemester}</TableCell>
                  <TableCell>{enrollment.enrollmentYear}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        enrollment.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {enrollment.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export const HostelManagement = () => {
  const [hostels, setHostels] = useState([]);
  const [allocations, setAllocations] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    gender: "",
    totalRooms: "",
    capacityPerRoom: "",
    feePerSemester: "",
    address: "",
  });

  useEffect(() => {
    fetchHostels();
    fetchAllocations();
  }, []);

  const fetchHostels = async () => {
    try {
      const response = await api.get("/api/hostels");
      setHostels(response.data);
    } catch (error) {
      toast.error("Failed to fetch hostels");
    }
  };

  const fetchAllocations = async () => {
    try {
      const response = await api.get("/api/hostels/allocations");
      setAllocations(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/hostels", formData);
      toast.success("Hostel created successfully");
      setShowForm(false);
      fetchHostels();
      setFormData({
        name: "",
        code: "",
        gender: "",
        totalRooms: "",
        capacityPerRoom: "",
        feePerSemester: "",
        address: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create hostel");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-4xl font-bold text-brand-blue">
          Hostel Management
        </h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-brand-blue"
          data-testid="add-hostel-button"
        >
          {showForm ? "Cancel" : "Add Hostel"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Hostel</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Hostel Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Hostel Code</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select
                    onValueChange={(value) =>
                      setFormData({ ...formData, gender: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="co-ed">Co-ed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Total Rooms</Label>
                  <Input
                    type="number"
                    value={formData.totalRooms}
                    onChange={(e) =>
                      setFormData({ ...formData, totalRooms: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Capacity per Room</Label>
                  <Input
                    type="number"
                    value={formData.capacityPerRoom}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        capacityPerRoom: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Fee per Semester</Label>
                  <Input
                    type="number"
                    value={formData.feePerSemester}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        feePerSemester: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
              <Button type="submit" className="bg-brand-blue">
                Create Hostel
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {hostels.map((hostel) => (
          <Card key={hostel._id}>
            <CardHeader>
              <CardTitle>
                {hostel.name} ({hostel.code})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Gender:</span>
                  <span className="font-medium capitalize">
                    {hostel.gender}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Rooms:</span>
                  <span className="font-medium">{hostel.totalRooms}</span>
                </div>
                <div className="flex justify-between">
                  <span>Available:</span>
                  <span className="font-medium text-green-600">
                    {hostel.availableRooms}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Capacity/Room:</span>
                  <span className="font-medium">{hostel.capacityPerRoom}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fee/Semester:</span>
                  <span className="font-medium">₹{hostel.feePerSemester}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hostel Allocations ({allocations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Hostel</TableHead>
                <TableHead>Room No</TableHead>
                <TableHead>Allocation Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocations.map((allocation) => (
                <TableRow key={allocation._id}>
                  <TableCell className="font-medium">
                    {allocation.studentId?.fullName}
                  </TableCell>
                  <TableCell>{allocation.hostelId?.name}</TableCell>
                  <TableCell>{allocation.roomNumber}</TableCell>
                  <TableCell>
                    {new Date(allocation.allocationDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        allocation.status === "allocated"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {allocation.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export const FeeManagement = () => {
  const [fees, setFees] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentId: "",
    enrollmentId: "",
    feeType: "",
    amount: "",
    semester: "",
    academicYear: "",
    dueDate: "",
  });
  const [stats, setStats] = useState({ total: 0, paid: 0, pending: 0 });

  useEffect(() => {
    fetchFees();
    fetchEnrollments();
  }, []);

  const fetchFees = async () => {
    try {
      const response = await api.get("/api/fees");
      setFees(response.data);

      const total = response.data.reduce((sum, f) => sum + f.amount, 0);
      const paid = response.data.reduce((sum, f) => sum + f.paidAmount, 0);
      setStats({ total, paid, pending: total - paid });
    } catch (error) {
      toast.error("Failed to fetch fees");
    }
  };

  const fetchEnrollments = async () => {
    try {
      const response = await api.get("/api/enrollments");
      setEnrollments(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/fees", formData);
      toast.success("Fee created successfully");
      setShowForm(false);
      fetchFees();
      setFormData({
        studentId: "",
        enrollmentId: "",
        feeType: "",
        amount: "",
        semester: "",
        academicYear: "",
        dueDate: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create fee");
    }
  };

  const handleEnrollmentSelect = (enrollmentId) => {
    const enrollment = enrollments.find((e) => e._id === enrollmentId);
    if (enrollment) {
      setFormData({
        ...formData,
        enrollmentId,
        studentId: enrollment.studentId._id,
      });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-4xl font-bold text-brand-blue">
          Fee Management
        </h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-brand-blue"
          data-testid="add-fee-button"
        >
          {showForm ? "Cancel" : "Add Fee Record"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total Fees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-blue">
              ₹{stats.total.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ₹{stats.paid.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              ₹{stats.pending.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create Fee Record</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Select Enrollment</Label>
                  <Select onValueChange={handleEnrollmentSelect} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select student" />
                    </SelectTrigger>
                    <SelectContent>
                      {enrollments.map((enrollment) => (
                        <SelectItem key={enrollment._id} value={enrollment._id}>
                          {enrollment.studentId?.fullName} -{" "}
                          {enrollment.enrollmentNo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Fee Type</Label>
                  <Select
                    onValueChange={(value) =>
                      setFormData({ ...formData, feeType: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tuition">Tuition</SelectItem>
                      <SelectItem value="hostel">Hostel</SelectItem>
                      <SelectItem value="exam">Exam</SelectItem>
                      <SelectItem value="library">Library</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Semester</Label>
                  <Input
                    type="number"
                    value={formData.semester}
                    onChange={(e) =>
                      setFormData({ ...formData, semester: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Academic Year</Label>
                  <Input
                    value={formData.academicYear}
                    onChange={(e) =>
                      setFormData({ ...formData, academicYear: e.target.value })
                    }
                    placeholder="2024-2025"
                  />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button type="submit" className="bg-brand-blue">
                Create Fee Record
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Fee Records ({fees.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fees.map((fee) => (
                <TableRow key={fee._id}>
                  <TableCell className="font-medium">
                    {fee.studentId?.fullName}
                  </TableCell>
                  <TableCell className="capitalize">{fee.feeType}</TableCell>
                  <TableCell>₹{fee.amount}</TableCell>
                  <TableCell>₹{fee.paidAmount}</TableCell>
                  <TableCell>
                    {fee.dueDate
                      ? new Date(fee.dueDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        fee.status === "paid"
                          ? "bg-green-100 text-green-800"
                          : fee.status === "overdue"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {fee.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export const ExamManagement = () => {
  const [exams, setExams] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    courseId: "",
    semester: "",
    examType: "",
    examDate: "",
    maxMarks: "",
    passingMarks: "",
  });

  useEffect(() => {
    fetchExams();
    fetchCourses();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await api.get("/api/exams");
      setExams(response.data);
    } catch (error) {
      toast.error("Failed to fetch exams");
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await api.get("/api/courses");
      setCourses(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/exams", formData);
      toast.success("Exam created successfully");
      setShowForm(false);
      fetchExams();
      setFormData({
        name: "",
        courseId: "",
        semester: "",
        examType: "",
        examDate: "",
        maxMarks: "",
        passingMarks: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to create exam");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-serif text-4xl font-bold text-brand-blue">
          Exam Management
        </h1>
        <Button
          onClick={() => setShowForm(!showForm)}
          className="bg-brand-blue"
          data-testid="add-exam-button"
        >
          {showForm ? "Cancel" : "Create Exam"}
        </Button>
      </div>

      {showForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create New Exam</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Exam Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="Mid-Term Exam"
                  />
                </div>
                <div>
                  <Label>Course</Label>
                  <Select
                    onValueChange={(value) =>
                      setFormData({ ...formData, courseId: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((course) => (
                        <SelectItem key={course._id} value={course._id}>
                          {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Semester</Label>
                  <Input
                    type="number"
                    value={formData.semester}
                    onChange={(e) =>
                      setFormData({ ...formData, semester: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Exam Type</Label>
                  <Select
                    onValueChange={(value) =>
                      setFormData({ ...formData, examType: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mid-term">Mid-Term</SelectItem>
                      <SelectItem value="end-term">End-Term</SelectItem>
                      <SelectItem value="practical">Practical</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Exam Date</Label>
                  <Input
                    type="date"
                    value={formData.examDate}
                    onChange={(e) =>
                      setFormData({ ...formData, examDate: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Maximum Marks</Label>
                  <Input
                    type="number"
                    value={formData.maxMarks}
                    onChange={(e) =>
                      setFormData({ ...formData, maxMarks: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <Label>Passing Marks</Label>
                  <Input
                    type="number"
                    value={formData.passingMarks}
                    onChange={(e) =>
                      setFormData({ ...formData, passingMarks: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="bg-brand-blue">
                Create Exam
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Exams ({exams.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Exam Name</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Max Marks</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam._id}>
                  <TableCell className="font-medium">{exam.name}</TableCell>
                  <TableCell>{exam.courseId?.name}</TableCell>
                  <TableCell>{exam.semester}</TableCell>
                  <TableCell className="capitalize">{exam.examType}</TableCell>
                  <TableCell>
                    {exam.examDate
                      ? new Date(exam.examDate).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell>{exam.maxMarks}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                        exam.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : exam.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {exam.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
