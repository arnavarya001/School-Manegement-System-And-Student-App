import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User,
  IndianRupee,
  Calendar,
  FileText,
  Package,
  ChevronRight,
  Download,
  Plus
} from 'lucide-react';
import axios from '../api/axios';

const StudentDetails = () => {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [bills, setBills] = useState([]);
  const [issuedItems, setIssuedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentRes, billsRes] = await Promise.all([
          axios.get(`/students/${id}`),
          axios.get(`/bills/student/${id}`)
        ]);
        setStudent(studentRes.data.data);
        setBills(billsRes.data.data);
      } catch (err) {
        console.error('Error fetching student details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="py-10 text-center">Loading student profile...</div>;
  if (!student) return <div className="py-10 text-center text-red-500">Student not found.</div>;

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'fees', name: 'Fees & Bills', icon: IndianRupee },
    { id: 'inventory', name: 'Issued Items', icon: Package },
    { id: 'attendance', name: 'Attendance', icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="card">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="h-24 w-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold">
            {student.firstName[0]}{student.lastName[0]}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold">{student.firstName} {student.lastName}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2 text-sm text-gray-500">
              <span className="flex items-center"><ChevronRight className="h-4 w-4 mr-1" /> {student.admissionNumber}</span>
              <span className="flex items-center"><ChevronRight className="h-4 w-4 mr-1" /> {student.class?.name} - {student.section?.name}</span>
              <span className="flex items-center"><ChevronRight className="h-4 w-4 mr-1" /> Roll: {student.rollNumber || 'N/A'}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button className="btn bg-gray-100 hover:bg-gray-200 text-gray-700">Edit Profile</button>
            <Link to="/fees" state={{ studentId: student._id }} className="btn btn-primary">Collect Fee</Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="h-4 w-4 mr-2" />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'profile' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card">
              <h3 className="font-bold mb-4 border-b pb-2">Personal Information</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Full Name</dt>
                  <dd className="font-medium">{student.firstName} {student.lastName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Date of Birth</dt>
                  <dd className="font-medium">{new Date(student.dateOfBirth).toLocaleDateString()}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Gender</dt>
                  <dd className="font-medium">{student.gender}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Academic Session</dt>
                  <dd className="font-medium">{student.academicSession}</dd>
                </div>
              </dl>
            </div>
            <div className="card">
              <h3 className="font-bold mb-4 border-b pb-2">Parent Information</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Parent Name</dt>
                  <dd className="font-medium">{student.parent?.fullName}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Mobile Number</dt>
                  <dd className="font-medium">{student.parent?.mobileNumber}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Email</dt>
                  <dd className="font-medium">{student.parent?.email}</dd>
                </div>
                <div className="flex flex-col">
                  <dt className="text-gray-500 mb-1">Address</dt>
                  <dd className="font-medium">{student.parent?.address}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {activeTab === 'fees' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold">Billing History</h3>
              <button className="btn btn-primary btn-sm flex items-center">
                <Plus className="h-4 w-4 mr-1" /> Generate Bill
              </button>
            </div>
            <div className="card overflow-hidden !p-0">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500">
                  <tr>
                    <th className="py-3 px-4">Bill No</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Total</th>
                    <th className="py-3 px-4">Paid</th>
                    <th className="py-3 px-4">Due</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {bills.map(bill => (
                    <tr key={bill._id}>
                      <td className="py-3 px-4 font-medium">{bill.billNumber}</td>
                      <td className="py-3 px-4">{bill.billType}</td>
                      <td className="py-3 px-4">₹{(bill.payableAmount / 100).toLocaleString()}</td>
                      <td className="py-3 px-4 text-green-600">₹{(bill.paidAmount / 100).toLocaleString()}</td>
                      <td className="py-3 px-4 text-red-600">₹{(bill.dueAmount / 100).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          bill.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {bill.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <a
                          href={`/api/v1/bills/${bill._id}/download`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 hover:bg-gray-100 rounded-full inline-block"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetails;
