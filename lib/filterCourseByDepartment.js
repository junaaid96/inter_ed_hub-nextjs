export default async function filterCourseByDepartment(department) {
    const res = await fetch(`https://inter-ed-hub-drf.onrender.com/courses/?department=${department}`);
    const data = await res.json();
    return data;
}