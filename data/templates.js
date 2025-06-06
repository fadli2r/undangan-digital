import ClassicTemplate from "../components/templates/Classic";
import ModernTemplate from "../components/templates/Modern";

export const templateList = [
  {
    slug: "classic",
    name: "Classic Elegant",
        component: ClassicTemplate, // <-- ini penting!

    thumbnail: "/images/bg_couple.jpg",
    description: "Tampilan formal dan elegan.",
  },
  {
    slug: "modern",
    name: "Modern Simple",
        component: ModernTemplate,

    thumbnail: "/images/bg_couple.jpg",
    description: "Clean & modern.",
  },
];

export const templateComponentMap = {
  classic: ClassicTemplate,
  modern: ModernTemplate,
};
