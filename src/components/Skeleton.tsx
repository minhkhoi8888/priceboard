import type { HTMLAttributes } from "react";

import { cx } from "../utils/classNames";

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

const Skeleton = ({ className, ...props }: SkeletonProps) => (
  <div
    aria-hidden="true"
    className={cx("trade-skeleton rounded-xl", className)}
    {...props}
  />
);

export default Skeleton;
