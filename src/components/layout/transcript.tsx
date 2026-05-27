'use client';

import React from 'react';
import Image from 'next/image';

// Define the shape of the user object
export type User = {
  full_name: string;
  email: string;
  student_number: string;
  college: string;
  department?: string;
  year_of_study?: string;
};

export type Course = {
  id: string;
  name: string;
  credits: string;
  grade: string;
};

type Grade = 'S' | 'A' | 'B' | 'C' | 'D' | 'E' | 'U';
type GradeInfo = { grade: Grade; percentage: number; color: string };

export type Stats = {
    cgpa: number;
    completedCourses: number;
    pendingCourses: number;
    degreeProgress: number;
    gradeDistribution: GradeInfo[];
}

interface TranscriptTemplateProps {
  user: User | null;
  courses: Course[];
  stats: Stats;
}

const gradeColorMap: Record<string, string> = {
  S: 'bg-blue-100 text-blue-800',
  A: 'bg-green-100 text-green-800',
  B: 'bg-yellow-100 text-yellow-800',
  C: 'bg-orange-100 text-orange-800',
  D: 'bg-red-100 text-red-800',
  E: 'bg-red-200 text-red-900',
  U: 'bg-gray-200 text-gray-800',
};


export const TranscriptTemplate = React.forwardRef<HTMLDivElement, TranscriptTemplateProps>(({ user, courses, stats }, ref) => {
  if (!user) return null;
  
  const getGradeColor = (grade: string) => {
    return gradeColorMap[grade.trim() as Grade] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div ref={ref} className="p-10 bg-white" style={{ width: '800px' }}>
      <header className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Image src="/images/logo.png" alt="UniVault Logo" width={60} height={60} unoptimized />
          <div>
            <h1 className="text-2xl font-bold text-gray-800">UNIVAULT</h1>
            <p className="text-sm text-gray-500">Official Student Transcript</p>
          </div>
        </div>
        <div className="text-right text-gray-700">
          <p className="font-semibold">{user.full_name}</p>
          <p className="text-sm">{user.email}</p>
          <p className="text-sm">Student ID: {user.student_number}</p>
        </div>
      </header>

      <section className="my-6">
        <div className="rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">Academic Summary</h2>
            </div>
            <div className="p-4 grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-blue-600">{stats.cgpa.toFixed(2)}</p>
                    <p className="text-xs text-gray-500 uppercase">CGPA</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-green-600">{stats.completedCourses}</p>
                    <p className="text-xs text-gray-500 uppercase">Courses Completed</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-3xl font-bold text-orange-600">{stats.pendingCourses}</p>
                    <p className="text-xs text-gray-500 uppercase">Courses Pending</p>
                </div>
            </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Completed Courses</h2>
        <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
                <tr>
                    <th className="px-4 py-2 text-left font-medium w-[100px]">Course ID</th>
                    <th className="px-4 py-2 text-left font-medium">Course Name</th>
                    <th className="px-4 py-2 text-center font-medium">Credits</th>
                    <th className="px-4 py-2 text-right font-medium">Grade</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                {courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-gray-500">{course.id}</td>
                    <td className="px-4 py-2 font-medium text-gray-800">{course.name.trim()}</td>
                    <td className="px-4 py-2 text-center text-gray-700">{course.credits}</td>
                    <td className="px-4 py-2 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getGradeColor(course.grade.trim())}`}>
                            {course.grade.trim()}
                        </span>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </section>

      <footer className="mt-8 pt-4 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>Generated on: {new Date().toLocaleDateString()}</p>
        <p>UniVault Platform | {user.college}</p>
        <p>This is a computer-generated document and does not require a signature.</p>
      </footer>
    </div>
  );
});

TranscriptTemplate.displayName = 'TranscriptTemplate';
