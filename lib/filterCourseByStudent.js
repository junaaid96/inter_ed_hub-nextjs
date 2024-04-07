export default async function filterCourseByStudent(student) {
    const res = await fetch(
        `https://inter-ed-hub-drf.onrender.com/courses/?enrolled_student=${student}`,
        { cache: "no-store" }
    );
    const data = await res.json();
    return data;
}
