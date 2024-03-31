import getTeacher from "@/lib/getTeacher";
import Image from "next/image";

export async function generateMetadata({ params }) {
    const { id } = params;
    const teacher = await getTeacher({ id });

    return {
        title: "Teacher | " + teacher.first_name + " " + teacher.last_name,
        description: teacher.bio,
    };
}

export default async function TeacherDetails({ params }) {
    const { id } = params;
    const teacher = await getTeacher({ id });

    return (
        <div className="bg-base-100 min-h-screen py-12">
            <div className="px-12">
                <div className="shadow-md rounded-md overflow-hidden">
                    <div className="px-6 py-8 sm:flex sm:items-center sm:justify-between">
                        <div className="flex items-center mt-4 sm:mt-0">
                            <div className="relative w-52 h-52 overflow-hidden rounded-lg">
                                <Image
                                    fill
                                    src={teacher.profile_pic}
                                    alt="Profile Image"
                                />
                            </div>
                            <div className="ml-4">
                                <p className="text-gray-800 font-semibold">
                                    {teacher.first_name} {teacher.last_name}
                                </p>
                                <p className="text-gray-600">{teacher.email}</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-6">
                        <div className="border-b border-gray-200 pb-4 mb-4">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                Professional Information
                            </h2>
                            <p className="text-gray-700">
                                <span className="font-semibold">
                                    Designation:
                                </span>{" "}
                                {teacher.designation}
                            </p>
                            <p className="text-gray-700">
                                <span className="font-semibold">
                                    Department:
                                </span>{" "}
                                {teacher.department}
                            </p>
                        </div>
                        <div className="border-b border-gray-200 pb-4 mb-4">
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                Personal Information
                            </h2>
                            <p className="text-gray-700">
                                <span className="font-semibold">Phone:</span>{" "}
                                {teacher.phone}
                            </p>
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-2">
                                About Teacher
                            </h2>
                            <p className="text-gray-700">{teacher.bio}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
