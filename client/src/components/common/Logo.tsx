import { Link } from "react-router-dom";
import LogoImg from "../../assets/spark-logo.jpg";

type LogoProps = {
  size?: number | string;
  to?: string;
  className?: string;
};

export default function Logo({ size = 64, to = "/login", className = "" }: LogoProps) {
  return (
    <Link to={to} className={`inline-flex items-center justify-center ${className}`}>
      <img
        src={LogoImg}
        alt="SparkLink Logo"
        style={{ height: size, width: "auto" }}
        className="object-contain"
      />
    </Link>
  );
}
