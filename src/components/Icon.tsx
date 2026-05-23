import { useMemo, type CSSProperties, type HTMLAttributes } from "react";

const iconModules = import.meta.glob("../assets/icons/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

const icons = Object.fromEntries(
  Object.entries(iconModules).map(([path, content]) => {
    const fileName = path.split("/").pop()?.replace(/\.svg$/i, "") ?? path;

    return [fileName, content];
  }),
) as Record<string, string>;

export type IconName = keyof typeof icons;

interface IconProps extends HTMLAttributes<HTMLSpanElement> {
  name?: IconName | (string & {});
  src?: string;
  svg?: string;
  color?: string;
  strokeColor?: string;
  fillColor?: string;
  size?: number | string;
}

export const Icon = ({
  name,
  src,
  svg,
  color,
  strokeColor,
  fillColor,
  size = 20,
  className = "",
  style,
  ...props
}: IconProps) => {
  const svgContent = useMemo(() => {
    const source = (name ? icons[name] : undefined) ?? svg ?? src;

    if (!source) {
      return "";
    }

    let processedSvg = source;

    processedSvg = processedSvg.replace(/<svg([^>]*)>/i, (_, attrs) => {
      const withoutSize = attrs
        .replace(/\swidth=(['"])[^'"]*\1/i, "")
        .replace(/\sheight=(['"])[^'"]*\1/i, "");

      return `<svg${withoutSize} width="100%" height="100%" style="display:block;color:var(--icon-color,currentColor)">`;
    });

    processedSvg = processedSvg.replace(
      /stroke=(['"])(?!none\1)[^'"]*\1/gi,
      'stroke="var(--icon-stroke, currentColor)"',
    );

    processedSvg = processedSvg.replace(
      /fill=(['"])(?!none\1)[^'"]*\1/gi,
      'fill="var(--icon-fill, currentColor)"',
    );

    return processedSvg;
  }, [name, src, svg]);

  const iconStyle = {
    width: size,
    height: size,
    color: color || "currentColor",
    "--icon-color": color || "currentColor",
    "--icon-stroke": strokeColor || color || "currentColor",
    "--icon-fill": fillColor || color || "currentColor",
    ...style,
  } as CSSProperties;

  return (
    <span
      className={`inline-flex items-center justify-center ${className}`}
      style={iconStyle}
      dangerouslySetInnerHTML={{ __html: svgContent }}
      {...props}
    />
  );
};
