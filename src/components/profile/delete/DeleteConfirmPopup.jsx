import React, { useState } from "react";
import { deleteStudentAccount } from "../../../services/firestoreService";
import Loading from "../../common/Loading";
import { useNavigate } from "react-router-dom";
import { loginWithEmail } from "../../../services/authService";
import PopupInput from "./PopupInput";
import { passwordValidError } from "../../common/utils/inputValidation";

const DeleteConfirmPopup = (props) => {

    const navigate = useNavigate();

    const userEmail = props.email;
    const onCancel = props.onCancel;

    const [inputs, setInputs] = useState({
        email: '',
        password: '',
    })

    const [errors, setErrors] = useState({
        email: '',
        password: '',
        auth: '',
    })

    const [isLoading, setLoading] = useState(false);

    const onDelete = async () => {
        if (!errors.email && !errors.password) {
            setLoading(true);

            const email = inputs.email;
            const password = inputs.password;

            try {
                const userAuth = await loginWithEmail(email, password);

                try {
                    await deleteStudentAccount(email, userAuth);
                    document.cookie = 'auth=; max-age=0'
                    document.cookie = 'userDocPath=; max-age=0'

                    navigate("/signup");
                } catch (e) {
                    console.error(e);

                    navigate(
                        "/unexpected",
                        {
                            state: {
                                name: e.name,
                                message: e.message
                            }
                        }
                    )
                }

            } catch (e) {
                console.log(e);

                setErrors(prev => ({
                    ...prev,
                    auth: e.message
                }));

                setLoading(false);
            }
        }
    }

    const onInput = (e) => {
        const { name, value } = e.target;

        setInputs(prev => ({
            ...prev,
            [name]: value
        }));

        validateInput(e);
    }

    const validateInput = (e) => {
        const { name, value } = e.target;

        setErrors(prev => ({
            ...prev,
            auth: ''
        }));

        switch (name) {
            case "email":
                if (!value) {
                    setErrors(prev => ({
                        ...prev,
                        email: 'Email cannot be empty.'
                    }));
                } else if (value !== userEmail) {
                    setErrors(prev => ({
                        ...prev,
                        email: 'Email does not match your account.'
                    }));
                } else {
                    setErrors(prev => ({
                        ...prev,
                        email: ''
                    }));
                }
                break;
            case "password":
                setErrors(prev => ({
                    ...prev,
                    password: passwordValidError(value)
                }));
                break;
            default:
                break;
        }
    }

    return (
        <div
            className="fixed top-0 bottom-0 left-0 right-0 z-50 bg-[rgba(0,0,0,0.5)]"
            onClick={onCancel}
        >
            <div className="flex flex-col items-center justify-center min-h-screen min-w-screen">
                <form
                    className="flex flex-col items-center justify-center max-w-3xl rounded-2xl p-6 bg-white"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="text-red-500 font-bold text-xl">
                        CAUTION!
                    </div>
                    <div className="text-red-500 font-semibold italic text-center mt-2">
                        This action will delete your account<br />
                        and cannot be undo.
                    </div>

                    <div className="text-black font-semibold text-center mt-4">
                        To continue, please confirm your authentication.
                    </div>

                    <PopupInput
                        type="email"
                        name="email"
                        placeholder="Email"
                        autoComplete="username"
                        onChange={onInput}
                        onBlur={validateInput}
                        error={errors.email}
                    />

                    <PopupInput
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={onInput}
                        onBlur={validateInput}
                        error={errors.password}
                    />

                    <div className="grid grid-cols-2 gap-24 mt-6">
                        <button
                            className="buttonWarning font-semibold"
                            type="button"
                            onClick={onDelete}
                        >
                            {isLoading ? (<Loading />) : 'Delete'}
                        </button>
                        <button
                            className="button font-semibold py-1 px-3"
                            type="button"
                            onClick={onCancel}
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default DeleteConfirmPopup;