export default async function filterCourseByTeacher(teacher) {
    const res = await fetch(`https://inter-ed-hub-drf.onrender.com/courses/?teacher=${teacher}`);
    const data = await res.json();
    return data;
}