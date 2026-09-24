import {
    BookOpenText,
    Code,
    GraduationCap,
    Leaf,
    MathOperations,
    MusicNotes,
    PaintBrush,
} from "@phosphor-icons/react";

const ICONS = [
    [/music|perform/, MusicNotes],
    [/math|stat/, MathOperations],
    [/lang|lit|writ/, BookOpenText],
    [/environ|sustain|climate|bio/, Leaf],
    [/art|design|paint/, PaintBrush],
    [/comput|code|program|software|data/, Code],
];

export default function DepartmentIcon({ slug = "", ...props }) {
    const Icon = ICONS.find(([re]) => re.test(slug))?.[1] || GraduationCap;
    return <Icon weight="duotone" {...props} />;
}
