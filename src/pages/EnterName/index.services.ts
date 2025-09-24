import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAppContext } from 'src/store/context';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

type PasswordForm = {
  firstname: string;
  lastname: string;
};

export const useBackup = () => {
  const { t: translate } = useTranslation();
  const { hash = '' } = useLocation();

  const navigate = useNavigate();
  const { dispatch } = useAppContext();

  const createSchema = () =>
    yup.object().shape({
      firstname: yup.string().required(),
      lastname: yup.string().required(),
    });
  const schema = createSchema();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver<PasswordForm>(schema),
  });

  const onSubmit = async (formData: PasswordForm) => {
    dispatch({ type: 'SET_NAME', payload: { firstname: formData.firstname, lastname: formData.lastname } });
    navigate(`/biometric-setup${hash}`);
  };
  const disabled = !isValid;
  return {
    translate,
    navigate,
    register,
    errors,
    handleSubmit,
    onSubmit,
    disabled,
  };
};
