import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { GraduationCap, Users, BookOpen, Calendar, Bell, ChevronRight } from 'lucide-react';
import api from '../utils/api';

const HomePage = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ totalCourses: 0, totalSeats: 0 });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await api.get('/api/courses');
      setCourses(response.data.slice(0, 6));
      
      const total = response.data.reduce((sum, c) => sum + c.totalSeats, 0);
      const available = response.data.reduce((sum, c) => sum + c.availableSeats, 0);
      
      setStats({
        totalCourses: response.data.length,
        totalSeats: total,
        availableSeats: available
      });
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 backdrop-blur-md bg-white/80 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <GraduationCap className="h-8 w-8 text-brand-blue" />
              <span className="font-serif text-2xl font-bold text-brand-blue">Student Life Cycle Management System</span>
            </Link>
            
            <div className="flex items-center space-x-6">
              <Link to="/courses" className="text-slate-600 hover:text-brand-blue transition-colors">
                Courses
              </Link>
              {user ? (
                <>
                  <Button 
                    variant="ghost" 
                    onClick={() => navigate(getDashboardRoute(user.role))}
                    data-testid="dashboard-link"
                  >
                    Dashboard
                  </Button>
                  <Button variant="outline" onClick={onLogout} data-testid="logout-button">
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" data-testid="login-button">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button className="bg-brand-blue hover:bg-brand-blue/90" data-testid="register-button">
                      Register
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-brand-gold/5"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-20 py-20 lg:py-32 relative">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <motion.div 
              className="md:col-span-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight text-brand-blue mb-6">
                Shape Your Future
                <br />
                <span className="text-brand-gold">Excellence Awaits</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-2xl">
                Join our prestigious institution where innovation meets tradition. 
                Start your academic journey with world-class education and cutting-edge facilities.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to={user ? "/apply" : "/register"}>
                  <Button 
                    size="lg" 
                    className="bg-brand-gold hover:bg-brand-gold/90 text-white px-8"
                    data-testid="apply-now-button"
                  >
                    Apply Now <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/courses">
                  <Button size="lg" variant="outline" data-testid="view-programs-button">
                    View Programs
                  </Button>
                </Link>
              </div>
            </motion.div>
            
            <motion.div 
              className="md:col-span-4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <img
                src="https://images.unsplash.com/photo-1760012587658-42503e1e3b9a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwxfHx1bml2ZXJzaXR5JTIwY2FtcHVzJTIwbW9kZXJuJTIwYXJjaGl0ZWN0dXJlJTIwc3R1ZGVudHMlMjBzdHVkeWluZ3xlbnwwfHx8fDE3NzAzNzc3MzB8MA&ixlib=rb-4.1.0&q=85"
                alt="Campus"
                className="rounded-xl shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StatCard icon={<BookOpen />} value={stats.totalCourses} label="Programs Offered" />
            <StatCard icon={<Users />} value={stats.totalSeats} label="Total Seats" />
            <StatCard icon={<GraduationCap />} value={stats.availableSeats} label="Seats Available" />
            <StatCard icon={<Calendar />} value="Ongoing" label="Admissions" />
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-20 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-serif text-4xl font-semibold text-brand-blue mb-4">
              Popular Programs
            </h2>
            <p className="text-slate-600 text-lg max-w-2xl mx-auto">
              Explore our diverse range of undergraduate and postgraduate programs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <CourseCard course={course} />
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/courses">
              <Button variant="outline" size="lg" data-testid="view-all-courses-button">
                View All Courses <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Notice Board */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="bg-gradient-to-br from-brand-blue to-brand-blue/90 rounded-2xl p-12 text-white">
            <div className="flex items-start space-x-4 mb-6">
              <Bell className="h-8 w-8" />
              <div>
                <h3 className="font-serif text-3xl font-semibold mb-2">Important Notice</h3>
                <p className="text-blue-100 text-lg">
                  Admissions for Academic Year {new Date().getFullYear()}-{new Date().getFullYear() + 1} are now open!
                </p>
              </div>
            </div>
            <ul className="space-y-3 ml-12">
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-brand-gold rounded-full"></div>
                <span>Application deadline: 30 days from today</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-brand-gold rounded-full"></div>
                <span>Merit-based selection process</span>
              </li>
              <li className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-brand-gold rounded-full"></div>
                <span>Limited seats available - Apply early!</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <GraduationCap className="h-8 w-8" />
                <span className="font-serif text-2xl font-bold">SLMS</span>
              </div>
              <p className="text-slate-400">
                Empowering students with world-class education since 1875.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/courses" className="hover:text-white transition-colors">Programs</Link></li>
                <li><Link to="/apply" className="hover:text-white transition-colors">Apply</Link></li>
                <li><Link to="/login" className="hover:text-white transition-colors">Student Portal</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact Us.</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Email: admissions@slmsS.edu</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Address: Aligarh, Uttar Pradesh</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; {new Date().getFullYear()} Team Stark. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const StatCard = ({ icon, value, label }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
    <div className="flex items-center space-x-4">
      <div className="p-3 bg-brand-blue/10 rounded-lg text-brand-blue">
        {React.cloneElement(icon, { className: 'h-6 w-6' })}
      </div>
      <div>
        <div className="text-3xl font-bold text-brand-blue">{value}</div>
        <div className="text-sm text-slate-600">{label}</div>
      </div>
    </div>
  </div>
);

const CourseCard = ({ course }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all hover:-translate-y-1" data-testid={`course-card-${course.code}`}>
    <div className="flex justify-between items-start mb-4">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-brand-gold">
          {course.programType}
        </span>
        <h3 className="font-serif text-xl font-semibold text-brand-blue mt-1">
          {course.name}
        </h3>
      </div>
    </div>
    <p className="text-sm text-slate-600 mb-4">
      Code: {course.code} | Duration: {course.duration} years
    </p>
    <div className="flex items-center justify-between">
      <div>
        <span className="text-sm text-slate-500">Available Seats</span>
        <div className="text-2xl font-bold text-brand-blue">
          {course.availableSeats}/{course.totalSeats}
        </div>
      </div>
      <Link to="/apply">
        <Button size="sm" className="bg-brand-blue hover:bg-brand-blue/90" data-testid={`apply-button-${course.code}`}>
          Apply
        </Button>
      </Link>
    </div>
  </div>
);

function getDashboardRoute(role) {
  switch (role) {
    case 'applicant': return '/applicant';
    case 'student': return '/student';
    case 'faculty': return '/faculty';
    case 'admin': return '/admin';
    default: return '/';
  }
}

export default HomePage;