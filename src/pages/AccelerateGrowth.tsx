import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Phone, Users, CreditCard, Shield, Headphones, User } from 'lucide-react';

export default function AccelerateGrowth() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    email: '',
    phoneNumber: '',
    numberOfEmployees: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // Handle form submission here
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-purple-700 py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            {/* Left Content */}
            <div className="flex-1 text-white">
              {/* Logo */}
              <div className="mb-8">
                <div className="text-2xl font-bold text-white mb-2">
                  ease<span className="text-cyan-300">·</span>works
                </div>
                <div className="text-sm text-cyan-300">
                  Empowering Growth. Enhancing Productivity.
                </div>
              </div>

              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Ensure <span className="text-cyan-300">compliance</span> and{' '}
                <span className="text-cyan-300">streamline</span> operations with
                a trusted PEO.
              </h1>
              
              <p className="text-lg text-purple-100 leading-relaxed max-w-lg">
                Easeworks has helped hundreds of employers drive sustained growth through 
                implementation of modern HR practices and strategies. Let us walk you through 
                cost and time-saving features today.
              </p>
            </div>

            {/* Right Form */}
            <div className="bg-white rounded-lg p-8 shadow-2xl w-full max-w-md">
              <div className="text-right mb-6">
                <div className="text-orange-500 font-semibold text-sm mb-2">
                  QUESTIONS? +1 (888) 843-0880
                </div>
                <h3 className="text-xl font-bold text-gray-800">
                  Ready for the next step? Let's talk!
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="First Name"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="rounded"
                  />
                  <Input
                    placeholder="Last Name"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="rounded"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Company Name"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange('companyName', e.target.value)}
                    className="rounded"
                  />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="rounded"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Phone Number"
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                    className="rounded"
                  />
                  <Select onValueChange={(value) => handleInputChange('numberOfEmployees', value)}>
                    <SelectTrigger className="rounded">
                      <SelectValue placeholder="# of Employees" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1-10">1-10</SelectItem>
                      <SelectItem value="11-50">11-50</SelectItem>
                      <SelectItem value="51-100">51-100</SelectItem>
                      <SelectItem value="101-500">101-500</SelectItem>
                      <SelectItem value="500+">500+</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded text-lg font-semibold"
                >
                  Submit Your Details
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left Content */}
            <div className="flex-1">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-8">
                Let's <span className="text-purple-600">Accelerate</span> Your Growth with
                Easeworks PEO
              </h2>
              
              <p className="text-xl text-gray-600 mb-12">
                With Easeworks PEO, your business will have:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-start gap-4">
                  <div className="bg-cyan-100 p-3 rounded-lg">
                    <CreditCard className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Payroll for all employees</h3>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-cyan-100 p-3 rounded-lg">
                    <Shield className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Top-notch benefits access</h3>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-cyan-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Cost-effective & fully compliant HR consulting</h3>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-cyan-100 p-3 rounded-lg">
                    <User className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Expert HR consulting</h3>
                  </div>
                </div>

                <div className="flex items-start gap-4 md:col-span-2">
                  <div className="bg-cyan-100 p-3 rounded-lg">
                    <Headphones className="h-6 w-6 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Live human support</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="flex-1">
              <div className="relative">
                <div className="bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full w-80 h-80 absolute -top-10 -right-10 opacity-20"></div>
                <div className="relative bg-white rounded-lg shadow-xl p-8">
                  <img 
                    src="https://images.unsplash.com/photo-1556157382-97eda2d62296?w=500&h=400&fit=crop&crop=face"
                    alt="Business professionals working together"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cookie Notice */}
      <div className="fixed bottom-0 left-0 right-0 bg-purple-700 text-white p-4 z-50">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <p className="text-sm">
              We use cookies on this site to enhance your user experience.
            </p>
            <p className="text-xs text-purple-200">
              By clicking any link on this page you are giving your consent for us to set cookies.{' '}
              <button className="underline hover:text-white">Learn More</button>
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              size="sm"
              className="bg-purple-600 hover:bg-purple-500 text-white"
            >
              Accept
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-white text-white hover:bg-white hover:text-purple-700"
            >
              Decline
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}