import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAppContext } from 'src/store/context';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useEffect } from 'react';

type NameForm = {
  firstname: string;
  lastname: string;
};

export const useEditName = () => {
  const { t: translate } = useTranslation();
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();

  const createSchema = () =>
    yup.object().shape({
      firstname: yup.string().required(translate('edit-name-form.firstname-required')),
      lastname: yup.string().required(translate('edit-name-form.lastname-required')),
    });

  const schema = createSchema();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver<NameForm>(schema),
    defaultValues: {
      firstname: state?.firstname || '',
      lastname: state?.lastname || '',
    },
  });

  useEffect(() => {
    if (state?.firstname) {
      setValue('firstname', state.firstname);
    }
    if (state?.lastname) {
      setValue('lastname', state.lastname);
    }
  }, [state?.firstname, state?.lastname, setValue]);

  const onSubmit = async (formData: NameForm) => {
    dispatch({ type: 'SET_NAME', payload: { firstname: formData.firstname, lastname: formData.lastname } });
    navigate('/settings');
  };

  const goBack = () => {
    navigate('/settings');
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
    goBack,
  };
};
