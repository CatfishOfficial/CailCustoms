// Whether the current session belongs to an admin. Backed by the SECURITY
// DEFINER `is_admin()` function (migration 004). Fails closed — any error
// (function missing, network) is treated as "not an admin".
export async function checkIsAdmin(supabase) {
  try {
    const { data } = await supabase.rpc("is_admin");
    return data === true;
  } catch {
    return false;
  }
}
