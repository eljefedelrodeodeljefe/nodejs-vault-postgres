#!/bin/sh

echo "------------- docker-compose up -d -------------"
docker-compose up -d
echo

echo "------------- docker-compose ps -------------"
docker-compose ps
echo

exec_in_vault() {
  echo "------------- $@ -------------"
  vault "$@"
  echo
}

export VAULT_ADDR='http://127.0.0.1:8200'

exec_in_vault auth "$(docker-compose logs vault | grep 'Root Token:' | tail -n 1 | awk '{ print $NF }')"
exec_in_vault status
exec_in_vault auth-enable userpass
exec_in_vault auth-enable -path=userpass2 userpass
exec_in_vault auth-enable github
exec_in_vault auth-enable radius
exec_in_vault auth-enable -path=awsaccount1 aws-ec2
exec_in_vault auth-enable okta
exec_in_vault auth-enable approle
exec_in_vault policy-write admin ./cluster/vault-ui/admin.hcl
exec_in_vault write auth/userpass/users/test password=test policies=admin
exec_in_vault write auth/userpass2/users/john password=doe policies=admin
exec_in_vault write auth/userpass/users/lame password=lame policies=default
exec_in_vault write auth/radius/users/test password=test policies=admin
exec_in_vault write secret/test somekey=somedata
exec_in_vault mount -path=ultrasecret generic
exec_in_vault write ultrasecret/moretest somekey=somedata
exec_in_vault write ultrasecret/dir1/secret somekey=somedata
exec_in_vault write ultrasecret/dir2/secret somekey=somedata
exec_in_vault write ultrasecret/dir2/secret2 somekey=somedata
exec_in_vault write ultrasecret/admincantlistthis/butcanreadthis somekey=somedata
exec_in_vault write ultrasecret/admincantreadthis somekey=somedata

exec_in_vault mount database

echo "------------- Vault Root Token -------------"
docker-compose logs vault | grep 'Root Token:' | tail -n 1
