import { useNavigate } from "react-router-dom";
import LogoImg from "../../assets/spark-logo.jpg";
import { useAuth } from "../../context/AuthContext";

type LogoProps = {
  size?: number | string;
  to?: string;
  className?: string;
};

export default function Logo({ size = 64, className = "" }: LogoProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  return (
    <a
      href={isAuthenticated ? "/dashboard" : "/login"}
      onClick={handleClick}
      className={`inline-flex items-center justify-center ${className}`}
      tabIndex={0}
      aria-label="SparkLink Home"
    >
      <img
        src={LogoImg}
        alt="SparkLink Logo"
        style={{ height: size, width: "auto" }}
        className="object-contain"
      />
    </a>
  );
}
