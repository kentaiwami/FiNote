log_file="/code/cron/log/$1.txt"
python_file="/usr/local/bin/python"
manage_file="/code/manage.py"
command="$1 $2"

echo -e "\n" >> $log_file
echo "`date` : executed automatically." >> $log_file
$python_file $manage_file $command >> $log_file 2>&1
echo -e "\n" >> $log_file
