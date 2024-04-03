import getCourse from "@/lib/getCourse";
import Image from "next/image";

export async function generateMetadata({ params }) {
    const { id } = params;
    const course = await getCourse(id);

    return {
        title: "Course | " + course.title,
        description: course.description,
    };
}

export default async function CourseDetails({ params }) {
    const { id } = params;
    const course = await getCourse(id);

    return (
        <div className="container bg-base-100 min-h-screen mx-auto mt-10 px-4">
            {course.id ? (
                <div className="flex gap-12">
                    <div>
                        <Image
                            src={course.image}
                            alt={course.title}
                            width={800}
                            height={800}
                            placeholder="blur"
                            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXz/2wBDARUXFx4aHjshITt8U0ZTfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHz/wAARCAAvAC8DASIAAhEBAxEB/8QAGAABAQEBAQAAAAAAAAAAAAAAAgEAAwb/xAAXEAEBAQEAAAAAAAAAAAAAAAAAAREC/8QAFgEBAQEAAAAAAAAAAAAAAAAAAQAC/8QAFREBAQAAAAAAAAAAAAAAAAAAABH/2gAMAwEAAhEDEQA/APQjVo2slmHVCVGtG0qOlC0rQoaTS0VCa0LVtc6jHfWxIUITBp0OgQo1aiT/2Q=="
                        />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold">{course.title}</h1>
                        <p className="text-gray-700 mt-2">
                            {course.description}
                        </p>
                        <div className="mt-4">
                            <p className="text-lg font-semibold">
                                Course Details:
                            </p>
                            <ul className="list-disc pl-6">
                                <li>Duration: {course.duration} hrs</li>
                                <li>Teacher: {course.teacher}</li>
                                <li>Department: {course.department}</li>
                                <li>Credit: {course.credit}</li>
                            </ul>
                            <div className="mt-10">
                                <button className="btn btn-primary">
                                    Enroll
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-red-600">Course Not Found!</p>
            )}
        </div>
    );
}
