import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar, { type Currency } from "../components/Navbar";
import GradientBackground from "@/components/GradientBackground";
import AuthForm from "@/components/AuthForm";

interface LoginPageProps {
    selectedCurrency: Currency;
    setSelectedCurrency: React.Dispatch<React.SetStateAction<Currency>>;
}

const LoginPage: React.FC<LoginPageProps> = ({ selectedCurrency, setSelectedCurrency }) => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSuccess = () => {
        login(); // mark user as authenticated
        navigate("/main");
    };

    return (
        <GradientBackground>
            <Navbar selectedCurrency={selectedCurrency} setSelectedCurrency={setSelectedCurrency} />
            <div className="flex flex-1 items-center justify-center p-6">
                <div className="w-full max-w-md bg-[#0F0C29] rounded-lg shadow p-6">
                    <h1 className="text-2xl font-bold mb-4 text-center text-white">
                        Sign in to TrailHead
                    </h1>

                    <AuthForm onSuccess={handleSuccess} />
                </div>
            </div>
        </GradientBackground>
    );
};

export default LoginPage;



