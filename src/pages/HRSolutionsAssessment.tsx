import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, CheckCircle, Users, Award } from 'lucide-react';

export default function HRSolutionsAssessment() {
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
                Comprehensive HR outsourcing{' '}
                <span className="text-cyan-300">customized for your business'</span>{' '}
                specific needs.
              </h1>
              
              <p className="text-lg text-purple-100 leading-relaxed max-w-lg">
                Easeworks is a PEO (Professional Employer Organization) that has helped 
                countless employers drive sustained growth through implementation of modern 
                HR practices and strategies. Find out how we can help, start with a{' '}
                <span className="font-semibold text-white">FREE HR Assessment</span>.
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

      {/* HR Compliance Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left Icon */}
            <div className="flex-shrink-0">
              <div className="relative">
                <div className="bg-yellow-400 rounded-full w-48 h-48 flex items-center justify-center shadow-xl">
                  <div className="bg-white rounded-full w-32 h-32 flex items-center justify-center">
                    <Shield className="h-16 w-16 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="flex-1">
              <h2 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-8">
                Ensure <span className="text-purple-600">HR Compliance</span> with
                a <span className="text-green-500">FREE</span> Assessment
              </h2>
              
              <div className="space-y-6 text-lg text-gray-600">
                <p>
                  Is your business fully protected from HR Claims? Did you know that a PAGA Claim can 
                  cost your business $484,000?
                </p>
                
                <p>
                  Start your journey to compliance & protection with a{' '}
                  <span className="text-green-500 font-bold">100% FREE</span>{' '}
                  HR Assessment from Easeworks. Our team will identify vulnerabilities 
                  and provide recommendations to safeguard your business.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
                  <div className="flex items-start gap-4">
                    <div className="bg-green-100 p-2 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Complete Risk Analysis</h3>
                      <p className="text-sm text-gray-600">
                        Comprehensive review of your current HR practices and policies
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Expert Consultation</h3>
                      <p className="text-sm text-gray-600">
                        Professional guidance from certified HR specialists
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Award className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Compliance Roadmap</h3>
                      <p className="text-sm text-gray-600">
                        Detailed action plan to achieve full compliance
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-cyan-100 p-2 rounded-lg">
                      <Shield className="h-6 w-6 text-cyan-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800 mb-2">Protection Strategy</h3>
                      <p className="text-sm text-gray-600">
                        Customized solutions to protect against costly claims
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-12">
                  <Button 
                    size="lg"
                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 text-lg font-semibold"
                  >
                    Get Your FREE Assessment
                  </Button>
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