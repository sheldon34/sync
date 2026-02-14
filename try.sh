num1=5

num2=10
sum= $((num2+num1))
difference =$((num2-num1))
product=$((num2*num1))
#Array
fruits=("apple","banana","cherry")
for fruit in  "{$fuits[@]}";do 
echo $fruit
done 

#Asssociative array 
declare -A colors
colors[apple]="red"
colors[banana]= "yellow"
colors[grape]="purple"
ubset colors[banana]
echo ${colors[grape]}
echo ${colors[apple]}
