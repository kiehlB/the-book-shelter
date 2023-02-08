import { useLazyQuery, useQuery } from '@apollo/client';
import { useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { whoAmIQuery } from '../../../lib/graphql/users';
import { getAuthInfoSuccess } from '../../../store/auth';
import { RootState } from '../../../store/rootReducer';

export default function useWhoAmI() {
  const dispatch = useDispatch();
  const { auth } = useSelector((state: RootState) => state.auth);

  console.log(auth);
  const [loading, { data: getUser, error }] = useLazyQuery(whoAmIQuery, {});

  const user = getUser?.whoami.id ? getUser?.whoami : undefined;

  useEffect(() => {
    if (user == undefined) return;

    dispatch(getAuthInfoSuccess(user));
  }, [user, dispatch]);

  return {
    loading,
    error,
    getUser,
    auth,
    user,
  };
}
